// script.js (최종 완성 코드)

// ===========================================
// 1. 사이드바 HTML 파일을 로드하여 삽입하는 함수
// ... (이하 이전과 동일)
// ===========================================
async function loadSidebar() {
    try {
        const response = await fetch('/sidebar.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText || 'Unknown error'}`);
        }
        const sidebarHtml = await response.text();
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        if (sidebarPlaceholder) {
            sidebarPlaceholder.innerHTML = sidebarHtml;
        } else {
            console.error("ID 'sidebar-placeholder'를 가진 요소를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("사이드바 로딩 중 오류 발생:", error);
    }
}

// ===========================================
// 2. 아코디언 상태를 localStorage에 저장하는 함수 (✨ 수정됨)
// ===========================================
function saveAccordionState() {
    const accordionItems = document.querySelectorAll('li.accordion-item');
    const states = [];
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const mainContent = item.querySelector('.accordion-content');
        
        const albumStates = [];
        const albumHeaders = item.querySelectorAll('.album-header');
        albumHeaders.forEach(albumHeader => {
            const albumContent = albumHeader.nextElementSibling;
            albumStates.push({
                active: albumHeader.classList.contains('active'),
                height: albumContent.style.maxHeight || '0px' // max-height 값을 저장
            });
        });

        states.push({
            mainActive: header.classList.contains('active'),
            mainHeight: mainContent.style.maxHeight || '0px', // max-height 값을 저장
            albums: albumStates
        });
    });
    localStorage.setItem('accordionStates', JSON.stringify(states));
}

// ===========================================
// 3. 아코디언 상태를 localStorage에서 불러와 적용하는 함수 (✨ 수정됨)
// ===========================================
function loadAccordionState() {
    const savedStates = localStorage.getItem('accordionStates');
    if (savedStates) {
        try {
            const states = JSON.parse(savedStates);
            const accordionItems = document.querySelectorAll('li.accordion-item');

            accordionItems.forEach((item, index) => {
                const state = states[index];
                if (!state || !state.mainActive) return;

                const mainHeader = item.querySelector('.accordion-header');
                const mainContent = item.querySelector('.accordion-content');
                if (!mainHeader || !mainContent) return;

                // 저장된 active 클래스와 height 값을 그대로 적용
                mainHeader.classList.add('active');
                mainContent.classList.add('active');
                mainContent.style.maxHeight = state.mainHeight;

                const albumHeaders = item.querySelectorAll('.album-header');
                albumHeaders.forEach((albumHeader, albumIndex) => {
                    const albumState = state.albums[albumIndex];
                    if (albumState && albumState.active) {
                        const albumContent = albumHeader.nextElementSibling;
                        if (albumContent) {
                            albumHeader.classList.add('active');
                            albumContent.style.maxHeight = albumState.height;
                        }
                    }
                });
            });
        } catch (e) {
            console.error("아코디언 상태를 불러오는 중 오류 발생:", e);
            localStorage.removeItem('accordionStates');
        }
    }
}

// ===========================================
// 4. 스크롤 위치를 localStorage에 저장하는 함수
// ... (이하 이전과 동일)
// ===========================================
function saveScrollPosition() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        localStorage.setItem('sidebarScrollPos', sidebar.scrollTop);
    }
}

// ===========================================
// 5. 스크롤 위치를 localStorage에서 불러와 적용하는 함수
// ... (이하 이전과 동일)
// ===========================================
function loadScrollPosition() {
    const savedPos = localStorage.getItem('sidebarScrollPos');
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && savedPos !== null) {
        setTimeout(() => {
            sidebar.scrollTop = parseFloat(savedPos);
        }, 100);
    }
}

// ===========================================
// 6. 메인 아코디언 기능을 설정하는 함수
// ... (이하 이전과 동일)
// ===========================================
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const wasActive = this.classList.contains('active');
            
            accordionHeaders.forEach(otherHeader => {
                const otherItem = otherHeader.closest('li.accordion-item');
                const otherContent = otherItem.querySelector('.accordion-content');
                otherHeader.classList.remove('active');
                otherContent.classList.remove('active');
                otherContent.style.maxHeight = "0";
            });

            if (!wasActive) {
                const accordionItem = this.closest('li.accordion-item');
                const accordionContent = accordionItem.querySelector('.accordion-content');
                
                this.classList.add('active');
                accordionContent.classList.add('active');
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            }
            
            saveAccordionState();
        });
    });
}

// ===========================================
// 7. 중첩 아코디언(앨범) 기능을 설정하는 함수
// ===========================================
function setupNestedAccordion() {
    const albumHeaders = document.querySelectorAll('.album-header');

    albumHeaders.forEach(header => {
        header.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const content = this.nextElementSibling; // 자식
            const mainContent = this.closest('.accordion-content'); // 부모
            if (!content || !mainContent) return;

            // 아코디언을 닫을 때
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                
                // 자식의 높이를 0으로 만들어 애니메이션 시작
                content.style.maxHeight = null; // CSS에 정의된 0으로 돌아가도록 null로 설정
                
                // 부모의 높이를 자식이 빠진 만큼으로 재설정하여 애니메이션 시작
                mainContent.style.maxHeight = mainContent.scrollHeight + 'px';

            } else { // 아코디언을 펼칠 때
                this.classList.add('active');
                
                // 1. 부모의 최종 높이를 (현재 높이 + 자식의 전체 높이)로 설정하여 애니메이션 시작
                mainContent.style.maxHeight = (mainContent.scrollHeight + content.scrollHeight) + 'px';
                
                // 2. 자식의 최종 높이를 설정하여 애니메이션 동시 시작
                content.style.maxHeight = content.scrollHeight + 'px';
            }
            
            saveAccordionState();
        });
    });
}

// ===========================================
// 8. 현재 활성화된 페이지에 따라 사이드바 메뉴에 시각적 표시를 추가
// ===========================================
function highlightActiveSidebarLink() {
    const currentPath = window.location.pathname; // 예: /2nd/1_%E3%81%9F%E3%81%A0%E5%A5%BD%E3%81%8D%E3%81%A8%E8%A8%80%E3%81%88%E3%81%9F%E3%82%89.html
    console.log('현재 페이지 경로 (currentPath):', currentPath);

    const sidebarLinks = document.querySelectorAll('.sidebar a');

    sidebarLinks.forEach(link => {
        const linkHref = link.getAttribute('href'); // 예: /2nd/1_ただ好きと言えたら.html
        console.log('사이드바 링크 href:', linkHref);

        // 중요: 두 값을 비교하기 전에 모두 디코딩하여 동일한 문자열로 만듭니다.
        // 그리고 currentPath가 linkHref로 끝나는지 확인합니다.
        if (decodeURIComponent(currentPath).endsWith(decodeURIComponent(linkHref))) {
            console.log('--- 일치하는 링크 발견! ---'); // 디버깅용 메시지

            // 현재 활성화된 링크의 <li> 요소에 'active-link' 클래스 추가
            const listItem = link.closest('li');
            if (listItem) {
                listItem.classList.add('active-link');
            }

            // 상위 앨범 헤더 (h3.album-header) 활성화
            const albumContent = link.closest('.album-content');
            if (albumContent) {
                albumContent.style.display = 'block'; // 앨범 내용을 펼침
                const albumHeader = albumContent.previousElementSibling;
                if (albumHeader && albumHeader.classList.contains('album-header')) {
                    albumHeader.classList.add('active');
                }
            }

            return;
        }
    });
}

// ===========================================
// 9. 페이지 로드 및 이벤트 리스너 설정 (✨ 수정됨)
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 사이드바 로드 및 이벤트 리스너 설정
    await loadSidebar();
    setupAccordion();
    setupNestedAccordion();

    // 2. DOMContentLoaded에서 높이 계산 없이 바로 상태 복원
    loadAccordionState();
    loadScrollPosition();

    // 3. 현재 활성화된 사이드바 링크 강조 (여기에 추가)
    highlightActiveSidebarLink(); // 이 줄을 추가합니다.

    // 페이지 이동 전에 상태를 저장하는 이벤트 리스너
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('scroll', saveScrollPosition);
    }
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            saveAccordionState();
            saveScrollPosition();
        });
    });
});