#!/usr/bin/env bash
# 관리자 웹 정적 파일 배포 — releases/<sha> 에 풀고 current 링크를 원자적으로 교체 (admin-spec 6-7)
# 실행: sudo bash admin-deploy.sh <s3://.../dist.tar.gz | 로컬 tar.gz 경로> <릴리스 이름(보통 커밋 sha)>
#   - CI: SSM Run Command(root)가 매 배포 S3에서 이 스크립트와 tar를 받아 실행한다. 서버에 설치하지 않는다(백엔드와 같은 방식).
#
# 종료 코드 — 0: 배포 성공 / 2: 새 릴리스가 응답 확인에 실패해 이전 릴리스로 되돌림 / 1: 사전 조건 실패(아무것도 바꾸지 않음)
# 롤백(수동): sudo ln -sfn /var/www/cinemory-admin/releases/<이전 sha> /var/www/cinemory-admin/current
set -euo pipefail

SOURCE=${1:?사용법: admin-deploy.sh <s3://... | 로컬 tar.gz 경로> <릴리스 이름>}
RELEASE=${2:?릴리스 이름(커밋 sha)이 필요합니다}
BASE=/var/www/cinemory-admin
RELEASES=$BASE/releases
CURRENT=$BASE/current
KEEP=2                                  # 직전 릴리스를 몇 개 보관할지(현재 포함)
HEALTH_URL=${HEALTH_URL:-https://admin.cinemory.co.kr/}
AWS=/snap/bin/aws                       # SSM 실행 환경은 PATH에 /snap/bin이 없을 수 있다

[[ $EUID -eq 0 ]] || { echo "sudo로 실행하세요." >&2; exit 1; }
[[ $RELEASE =~ ^[A-Za-z0-9._-]+$ ]] || { echo "릴리스 이름이 올바르지 않습니다: $RELEASE" >&2; exit 1; }
[[ -d $RELEASES ]] || { echo "$RELEASES 가 없습니다 — 서버 준비(런북 10-⑤)부터." >&2; exit 1; }

exec 9>/run/cinemory-admin-deploy.lock
flock -n 9 || { echo "다른 관리자 웹 배포가 진행 중입니다." >&2; exit 1; }

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
log() { echo "[$(date '+%H:%M:%S')] $*"; }

# 1) tar 가져오기 — 운영 파일은 아직 건드리지 않는다
log "dist 가져오기: $SOURCE"
if [[ $SOURCE == s3://* ]]; then
  "$AWS" s3 cp --only-show-errors "$SOURCE" "$WORK/dist.tar.gz"
else
  cp "$SOURCE" "$WORK/dist.tar.gz"
fi
[[ -s $WORK/dist.tar.gz ]] || { echo "dist.tar.gz가 비어 있습니다 — 아무것도 바꾸지 않았습니다." >&2; exit 1; }

# 2) 새 릴리스 폴더에 풀고 검증한다 — 같은 이름이 이미 있으면(재배포) 덮어쓰기 전에 치운다
mkdir -p "$WORK/extract"
tar -xzf "$WORK/dist.tar.gz" -C "$WORK/extract"
[[ -f $WORK/extract/index.html ]] || { echo "tar에 index.html이 없습니다 — 아무것도 바꾸지 않았습니다." >&2; exit 1; }
[[ -d $WORK/extract/assets ]] || { echo "tar에 assets/ 가 없습니다 — 아무것도 바꾸지 않았습니다." >&2; exit 1; }

TARGET=$RELEASES/$RELEASE
if [[ -e $TARGET ]]; then
  [[ $(readlink -f "$CURRENT") == "$(readlink -f "$TARGET")" ]] && { echo "현재 서비스 중인 릴리스와 같은 이름입니다: $RELEASE" >&2; exit 1; }
  rm -rf "$TARGET"
fi
mv "$WORK/extract" "$TARGET"
chmod -R a+rX "$TARGET"                  # Nginx(www-data)가 읽는다. mktemp 디렉터리는 700이다
touch "$TARGET"                          # 정리(5)는 수정 시각순이다 — tar가 복원한 빌드 시각이 아니라 배포 시각이어야 한다
log "릴리스 배치: $TARGET"

# 3) current 링크를 원자적으로 교체 — 임시 링크를 만든 뒤 mv -T로 덮어 중간 상태가 없다
PREVIOUS=$(readlink -f "$CURRENT" 2>/dev/null || true)
ln -sfn "$TARGET" "$BASE/current.new"
mv -T "$BASE/current.new" "$CURRENT"
log "current → $TARGET (이전: ${PREVIOUS:-없음})"

# 4) 응답 확인 — Vite 번들이 서빙되는지(index.html의 root 요소). 실패하면 이전 릴리스로 되돌린다
check() {
  local body
  body=$(curl -fsS --max-time 10 "$HEALTH_URL" 2>/dev/null) || return 1
  [[ $body == *'id="root"'* ]]
}
ok=false
for _ in 1 2 3 4 5; do
  if check; then ok=true; break; fi
  sleep 2
done
if [[ $ok != true ]]; then
  echo "새 릴리스가 응답하지 않습니다 — 이전 릴리스로 되돌립니다." >&2
  if [[ -n $PREVIOUS && -d $PREVIOUS ]]; then
    ln -sfn "$PREVIOUS" "$BASE/current.new"
    mv -T "$BASE/current.new" "$CURRENT"
    log "↩️  복구 완료: $PREVIOUS"
  fi
  rm -rf "$TARGET"
  exit 2
fi

# 5) 오래된 릴리스 정리 — 최근 KEEP개만(수정 시각 기준). 지금 서비스 중인 것은 항상 남긴다
cd "$RELEASES"
mapfile -t OLD < <(ls -1t | tail -n +$((KEEP + 1)))
for r in "${OLD[@]:-}"; do
  [[ -n $r ]] || continue
  [[ $(readlink -f "$CURRENT") == "$(readlink -f "$RELEASES/$r")" ]] && continue
  log "삭제: $r"
  rm -rf "${RELEASES:?}/$r"
done

log "✅ 배포 성공: $RELEASE"
