/* 방문 기록: 시각·페이지·기기 종류만 선생님 구글 시트로 보냅니다(이름·IP는 보내지 않음).
   ENDPOINT 가 비어 있으면 아무것도 하지 않습니다. */
(function () {
  var ENDPOINT = "";
  if (!ENDPOINT || location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  var id = "-";
  try {
    id = localStorage.getItem("tk-visitor");
    if (!id) { id = Math.random().toString(36).slice(2, 10); localStorage.setItem("tk-visitor", id); }
  } catch (e) {}
  var ua = navigator.userAgent;
  var os = /iPhone|iPod/.test(ua) ? "iPhone" : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad"
    : /Android/.test(ua) ? "Android" : /CrOS/.test(ua) ? "크롬북" : /Windows/.test(ua) ? "Windows" : /Macintosh/.test(ua) ? "Mac" : "기타";
  var data = new URLSearchParams({
    page: location.pathname.replace(/^\/teacher-kit/, "") || "/",
    ref: document.referrer.replace(/^https:\/\/guenhee9474-tech\.github\.io\/teacher-kit/, "(사이트 안)"),
    os: os, w: String(screen.width), id: id
  });
  try {
    if (!(navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, data))) fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: data });
  } catch (e) {}
})();
