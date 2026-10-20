# HANDOFF — 집 PC를 서버로

이 파일은 AI(웹 채팅의 Claude, Claude Code, 다른 AI)에게 건네는 인수인계 문서입니다.
교사가 쓰지 않는 집 PC를 늘 켜 두고, 학교나 휴대폰에서 들어가 Claude Code에게 일을 맡기는
작업실로 만들려고 합니다. 이 문서를 읽은 AI는 아래 순서와 규칙대로 함께 진행해 주세요.

설명 페이지: https://guenhee9474-tech.github.io/teacher-kit/homeserver/

---

## 1. AI에게: 이렇게 도와주세요

- **한 번에 한 단계씩** 진행합니다. 단계를 마칠 때마다 아래 "확인" 항목으로 됐는지 같이 확인한 뒤 다음으로 갑니다.
- 명령을 주기 전에 **그 명령이 무엇을 하는지 한두 문장으로** 먼저 설명합니다.
- `sudo` 또는 관리자 권한이 필요한 명령은 교사가 직접 입력하게 합니다. 비밀번호를 대화에 쓰게 하지 않습니다.
- 교사가 오류 메시지를 붙여 넣으면, 짐작으로 여러 해결책을 늘어놓지 말고 **원인을 확인하는 명령 하나**부터 제안합니다.
- 교사의 상황(아래 3절 질문)이 이 문서의 기본 경로와 다르면, 다른 점을 말하고 맞게 바꿔 안내합니다.
- 교사는 개발자가 아닙니다. 전문 용어는 처음 나올 때 한 줄로 풀어 줍니다.

## 2. 지켜야 할 규칙 (바꾸지 않음)

1. **학생 개인정보(성적, 상담, 출결, 연락처, 학번+이름)는 집 PC에 두지 않습니다.**
   학생 제출은 학교 구글 계정의 시트(Apps Script)에 쌓습니다. 이 PC로 학생 자료를 다루자는 제안을 하지 않습니다.
2. **공유기 포트 포워딩, DMZ, 공인 IP로 직접 공개를 제안하지 않습니다.**
   밖에서 들어오는 길은 Chrome 원격 데스크톱과 Tailscale(로그인한 내 기기끼리만 연결)만 씁니다.
3. 학생이 여는 페이지는 이 PC에 두지 않고 **GitHub Pages**에 둡니다. 집 PC가 꺼지면 멈추기 때문입니다.
4. 비밀번호, PIN, API 키, 토큰은 파일에 적거나 대화에 붙여 넣게 하지 않습니다.
5. 학교·교육청 지침이 개인 장비나 원격 접속을 막으면 그 지침이 먼저입니다.

## 3. 시작 전에 교사에게 물을 것

1. PC 종류: 데스크톱인가 노트북인가? 메모리(GB)와 저장장치(SSD/HDD)는?
2. Windows 10인가 11인가? Home인가 Pro인가? (`설정 → 시스템 → 정보`)
3. 인터넷: 공유기에 랜선으로 꽂을 수 있는가, 와이파이만인가?
4. 어디서 들어갈 것인가: 학교 PC, 휴대폰, 둘 다? 학교 PC에 프로그램 설치가 막혀 있는가?
5. 이 PC로 하고 싶은 일은 무엇인가? (예: Claude Code에게 긴 일 맡기기, 매일 아침 정리 작업, 파이썬 프로그램)
6. Claude 구독(Pro/Max)이 있는가? Claude Code를 이미 설치했는가?

답에 따라 1부만 할지, 2부까지 할지 같이 정합니다. 처음이면 **1부만으로 충분한지 먼저 써 보는 것**을 권합니다.

## 4. 전체 구조

연수(실습 페이지)에서 다룬 네 층 가운데 집 PC가 맡는 것은 백엔드의 일부뿐입니다.

| 층 | 연수에서 | 집 서버를 쓰면 |
|---|---|---|
| 프론트엔드 | index.html | 그대로 |
| 배포 | GitHub Pages | 그대로 |
| 백엔드 | Apps Script | 오래 걸리는 일, 정해진 시각에 도는 일을 집 PC가 더 맡음 |
| 데이터 | 구글 시트 | 그대로 (학생 데이터는 학교 계정에) |

```
[학교 PC / 휴대폰] --(Chrome 원격 데스크톱: 화면)--> [집 PC: Windows]
[학교 PC / 휴대폰] --(Tailscale + SSH: 터미널)----> [집 PC: WSL 우분투] -- tmux 안의 Claude Code, cron
```

## 5. 1부: 원격 화면으로 (약 30분)

### 1단계. 꺼지지 않게 하기
- 설정 → 시스템 → 전원: **절전 모드 "안 함"** (화면 끄기는 그대로 둬도 됨). PowerShell로는:
  ```
  powercfg /change standby-timeout-ac 0
  powercfg /change hibernate-timeout-ac 0
  ```
- 노트북: 제어판 → 전원 옵션 → 덮개를 닫으면 → "아무 것도 안 함"(전원 연결 시).
- Windows 업데이트 → 고급 옵션 → 사용 시간: 일을 맡겨 둔 시간에 재시작하지 않게.
- (선택) BIOS의 **Restore on AC Power Loss → Power On**: 정전 뒤 자동으로 켜짐. 메뉴 이름은 제조사마다 다르고 없을 수도 있음.
- **확인:** 30분 이상 두어도 PC가 절전으로 들어가지 않는다.

### 2단계. Chrome 원격 데스크톱
- 집 PC의 Chrome에서 https://remotedesktop.google.com/access → 원격 액세스 설정 → 설치 → PC 이름, PIN(6자리 이상, 짐작되는 숫자 피함).
- 학교 PC는 같은 주소, 휴대폰은 "Chrome 원격 데스크톱" 앱. 같은 **개인** 구글 계정으로 로그인(학교 Workspace 계정은 관리자가 막았을 수 있음).
- **확인:** 휴대폰 데이터(와이파이 끔)로 집 PC 화면이 보인다. 학교 망에서 안 되면 학교 망 차단일 수 있음 → 2부의 터미널 길.

### 3단계. Claude Code에게 일 맡기기
- Claude Code 설치(Windows PowerShell): `irm https://claude.ai/install.ps1 | iex` → 구독 계정으로 로그인.
- 원격 화면에서 PowerShell을 열고 작업 폴더에서 `claude` 실행 → 일을 맡김 → **창은 열어 둔 채 원격 연결만 끊음**.
- 길게 맡길 때는 권한 질문에서 멈춰 기다릴 수 있으므로, 맡기기 전에 무엇을 허락할지 정해 둠.
- **확인:** 연결을 끊었다가 다시 들어와도 Claude Code 창과 결과가 남아 있다.

## 6. 2부: 터미널 서버로 (선택, 약 1시간)

### 4단계. 우분투 설치 (WSL)
- PowerShell(관리자): `wsl --install` → 재시작 → 우분투 사용자 이름과 비밀번호 정하기.
- systemd 확인: `systemctl is-system-running` → `running`/`degraded`면 됨. `System has not been booted with systemd`면 `printf '[boot]\nsystemd=true\n' | sudo tee -a /etc/wsl.conf` → PowerShell `wsl --shutdown` → 우분투 다시 열기. (5단계 Tailscale이 systemd를 씀)
- 우분투 안에 Claude Code: `curl -fsSL https://claude.ai/install.sh | bash`
- **우분투가 계속 켜져 있게:** WSL은 열린 창이 없으면 잠시 뒤 멈춘다.
  작업 스케줄러 → 작업 만들기 → 트리거 "로그온할 때" → 동작 "프로그램 시작": 프로그램 `wsl.exe`, 인수 `-d Ubuntu --exec sleep infinity`.
  로그온 때 검은 창이 하나 뜨면 닫지 말고 최소화.
- **확인:** 재시작 → 로그온 → PowerShell에서 `wsl -l -v` 결과에 Ubuntu가 **Running**.
- 주의: 이 단계는 Windows 버전과 WSL 버전에 따라 다르게 동작할 수 있는, 가장 덜 검증된 단계입니다. 안 되면 `wsl --version`, `wsl -l -v` 결과를 보고 함께 다른 방법을 찾습니다.

### 5단계. Tailscale + SSH
- 우분투에서:
  ```
  curl -fsSL https://tailscale.com/install.sh | sh
  sudo tailscale up --ssh
  ```
  나온 주소를 열어 로그인.
- 학교 PC·휴대폰에도 Tailscale 앱 설치, 같은 계정으로 로그인. 휴대폰 SSH 앱은 Termius 등.
- 접속: `ssh 우분투사용자이름@집PC이름` (이름은 https://login.tailscale.com/admin/machines 에서 확인). 처음에 브라우저 확인 창이 뜰 수 있음.
- **확인:** 휴대폰에서 ssh로 들어가 `hostname`, `tailscale status`가 보인다.

### 6단계. tmux (창을 닫아도 계속)
- `sudo apt install -y tmux`
- `tmux new -s work` → 그 안에서 `claude` → 일 맡기기 → **Ctrl+b, 손 떼고 d** 로 빠져나옴 → 접속 끊어도 됨.
- 다시 들어가기: `tmux attach -t work`
- **확인:** ssh를 끊었다 다시 붙어도 `tmux attach -t work`로 같은 화면이 나온다.

### 7단계. cron (정해진 시각에)
- 예시 요청(교사가 Claude Code에게): "매주 월~금 아침 7시에 ~/class/notes 폴더의 어제 메모를 읽고 오늘 할 일을 다섯 줄로 정리해 ~/class/today.md 에 쓰는 작업을 cron으로 걸어 줘. claude -p 를 쓰고, 실행 기록은 ~/class/log.txt 에. 걸기 전에 crontab에 넣을 줄을 먼저 보여 줘."
- AI는 crontab 줄을 먼저 보여 주고 승인받은 뒤 건다. 로그를 반드시 남기게 한다.
- **확인:** 다음 날 `today.md`와 `log.txt`가 생겼다. `crontab -l`에 그 줄이 있다.

### 8단계. 점검과 백업 (한 달에 한 번)
- Windows 업데이트, 우분투 `sudo apt update && sudo apt upgrade -y`.
- 남길 파일은 GitHub 비공개 저장소나 구글 드라이브에 (학생 정보 없는 것만).
- 점검 요청: "이 PC에 바깥에서 들어올 수 있는 길(열린 포트, 원격 접속 프로그램)을 점검해서 목록으로 보고해 줘. 고치지는 말고 보고만."

## 7. 시연 (수업·연수용, 5분)

- 우분투의 한 폴더에 `index.html`을 두고 `python3 -m http.server 8000`
- Tailscale을 켠 휴대폰 브라우저에서 `http://집PC이름:8000`
- 우분투 창에 찍히는 `"GET / HTTP/1.1" 200` 줄 = 요청, 휴대폰에 뜬 페이지 = 응답.
- 끝나면 Ctrl+C. 늘 열어 둘 페이지는 GitHub Pages에.

## 8. 자주 막히는 곳

| 증상 | 먼저 볼 것 |
|---|---|
| 학교에서 원격 화면이 안 열림 | 휴대폰 데이터로는 되는가? 되면 학교 망 차단 |
| ssh가 안 됨 | `wsl -l -v`(Running?), `tailscale status`(로그인?), 휴대폰 Tailscale 앱 켜짐? |
| 재시작 뒤 우분투가 안 켜짐 | Windows에 로그온했는가? (4단계 작업은 로그온해야 돎) |
| 맡긴 일이 멈춰 있음 | `tmux attach -t work`로 들어가 권한 질문 대기인지 확인 |
| 정전 뒤 PC가 안 켜짐 | BIOS의 Restore on AC Power Loss |

## 9. 장점과 단점 (교사와 결정할 때 참고)

- 장점: 전기료만 듦, 긴 일·예약 작업·학교 PC에 못 까는 프로그램, 어디서든 접속, 서버 개념을 직접 배움.
- 단점: 관리(업데이트·재시작·백업)가 교사 몫, 꺼지면 멈춤, 학생 정보를 다룰 수 없음, 학교 망이 막을 수 있음, 처음 설정 1~2시간.
- 한 줄 결론: **나 혼자 쓰는 작업실로는 좋고, 학생이 쓰는 서비스로는 맞지 않는다.**

## 10. 이 문서 밖으로 가지 않을 것

- 학생 대상 서비스 운영, 공개 웹 서버, 포트 개방, 도메인 연결은 이 문서의 범위가 아닙니다. 교사가 원하면 "왜 이 문서가 그것을 권하지 않는지"(2절)를 먼저 설명하고, 학교 정보 담당자와 상의하도록 권합니다.
