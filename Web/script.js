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
// 7. 중첩 아코디언(앨범) 기능을 설정하는 함수 (✨ 최종 로직)
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
// 8. 페이지 로드 및 이벤트 리스너 설정 (✨ 수정됨)
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 사이드바 로드 및 이벤트 리스너 설정
    await loadSidebar();
    setupAccordion();
    setupNestedAccordion();

    // 2. DOMContentLoaded에서 높이 계산 없이 바로 상태 복원
    loadAccordionState();
    loadScrollPosition();

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