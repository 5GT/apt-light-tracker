# 아파트 단지 조명 점검 프로토타입

모바일 현장에서 단지 전기 도면을 보며 조명 상태를 기록하는 정적 웹앱 프로토타입입니다.

## 실행

```powershell
cd C:\Users\USER\Desktop\GT\apt-light-tracker
C:\Users\USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 아래 주소를 엽니다.

```txt
http://127.0.0.1:4173/
```

## 포함 기능

- 실제 전기 도면 PDF 기반 화면
- 모바일 확대, 축소, 드래그 이동
- 현재 위치를 보여주는 미니맵
- 샘플 조명 핀 20개
- 상태 색상 표시
- 하단 점검 패널
- 상태 변경: 정상, 점멸, 미점등, 파손
- 필터: 전체, 불량만, 미점검만, 보안등, 조경등
- 핀 추가, 수정, 삭제
- 빠른 메모
- 브라우저 localStorage 저장
- JSON 내보내기

## 주요 파일

- `index.html`
- `src/app.js`
- `src/styles.css`
- `src/data/lights.json`
- `public/maps/apartment-electrical-plan.pdf`

## 도면 이미지 교체

현재 앱은 모바일 확대 품질을 위해 PDF 대신 고해상도 WebP 이미지를 사용합니다.

다른 도면을 쓰려면 새 이미지 파일명을 아래 파일명으로 바꿔 덮어씁니다.

```txt
public/maps/apartment-site-plan-clean-v2.webp
```

앱은 이미지의 실제 픽셀 크기를 자동으로 읽어서 도면 영역과 미니맵을 맞춥니다.

주의할 점:

- 기존 핀 좌표는 기존 도면 기준입니다.
- 다른 도면으로 교체하면 핀 위치가 맞지 않을 수 있습니다.
- 이 경우 앱의 편집 모드에서 핀을 새로 추가하거나 위치 데이터를 조정해야 합니다.

## GitHub Pages 재배포

파일 수정 후 GitHub Pages에 다시 올릴 때는 PowerShell에서 실행합니다.

```powershell
PowerShell -ExecutionPolicy Bypass -File .\publish-github.ps1
```
