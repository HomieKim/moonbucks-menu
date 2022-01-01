
/*
step1. 요구사항 구현을 위한 전략
# TODO 메뉴 추가
- 메뉴의 이름을 입력 받고 엔터키 입력으로 추가한다.
- 추가되는 메뉴는 id="espresso-menu-list" ul 태그에 삽입
- 총 메뉴 갯수를 count하여 상단에 보여 줌
- 메뉴가 추가되고 나면, input은 빈 값으로 초기화 된다.
- 사용자 입력값이 빈 값이라면 추가 되지 않는다.

# TODO메뉴 수정
- 메뉴의 수정 버튼 클릭 이벤트를 받고, 메뉴 수정하는 prompt 띄워줌
- prompt에서 신규메뉴명을 입력받고, 확인버튼으로 수정완료

# TODO메뉴 삭제
- 메뉴 삭제 버튼 클릭 이벤트를 받고, 메뉴 삭제 컨펌 모달창이 뜸
- 확인 버튼누르면 메뉴 삭제
- 총 메뉴 갯수를 COUNT하여 상단에 보여줌

*/

const $ = (selector) => document.querySelector(selector); 

function App(){
    // 총 갯수 업데이트 하는 함수
    const updateMenuCount = () => {
      const menuCount= $("#espresso-menu-list").querySelectorAll("li").length;
      $(".menu-count").innerText = `총 ${menuCount}개`;
    }

    // 메뉴 추가하는 함수
    const addMenuName= ()=> {
      const espressoMenuName = $("#espresso-menu-name").value;
      if(espressoMenuName === ''){
          alert("값을 추가해 주세요");
          return;
      }
      console.log(espressoMenuName);
      const menuItemTemplate = (espressoMenuName) =>{
          return(
              `<li class="menu-list-item d-flex items-center py-2">
              <span class="w-100 pl-2 menu-name">${espressoMenuName}</span>
              <button
                type="button"
                class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
              >
                수정
              </button>
              <button
                type="button"
                class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
              >
                삭제
              </button>
            </li>`
          )
      };
      $("#espresso-menu-list").insertAdjacentHTML("beforeend", 
          menuItemTemplate(espressoMenuName)
      );
      updateMenuCount();
      $("#espresso-menu-name").value = "";
  };

    // 메뉴 수정하는 함수
    const updateMenuName = (e) => {
      const menuName = e.target.closest("li").querySelector(".menu-name");
      const updatedMenuName = prompt("메뉴명을 수정하세요",menuName.innerText);
      menuName.innerText = updatedMenuName;
    }

    // 메뉴 삭제하는 함수
    const deleteMenu = (e) => {
      e.target.closest("li").remove();
      updateMenuCount();
    }

    // 메뉴 수정 시 menu-list에 아직 자식이 추가되지 않았음으로 이벤트 위임을 통해 전달함
    $("#espresso-menu-list").addEventListener("click", (e) => {
      if(e.target.classList.contains("menu-edit-button")){
        updateMenuName(e);
      }
      if(e.target.classList.contains("menu-remove-button")){
        if(confirm("정말 삭제하시겠습니까?")){
          deleteMenu(e);
        }
      }
    });


    // form 태그 submit 시 새로고침되는 거 막아줌
    $("#espresso-menu-form").addEventListener("submit", e =>{
        e.preventDefault();
        console.log('preventDefault 실행');
    });

    // 메뉴 이름 입력 받음
    $("#espresso-menu-submit-button").addEventListener("click", addMenuName); // 이벤트를 따로 사용하지 않는 경우 함수명만 파라미터로 넘겨주면 함수의 주소가 바인딩 됨

    $("#espresso-menu-form").addEventListener("keypress", e=> {
        if(e.key !== "Enter"){
          return;
        }
        addMenuName();
    });

}

App();

