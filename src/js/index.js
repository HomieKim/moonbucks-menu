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

/*
step2. 요구사항 정리
# TODO localStorage Read & Write
- lacalStorage에 데이터를 저장
- localStorage에 있는 데이터를 읽어옴

# TODO 카테고리별 메뉴판 관리
- 에스프레서, 프라푸치노, 블렌디드, 티바나, 디저트 각각 따로 상태 관리

# TODO 페이지 접근시 최초 데이터 Read & Rendering
- 페이지 최초 로딩 시 localStorage에서 에스프레소 메뉴를 읽어옴
- 에스프레소 메뉴를 list에 뿌려줌
- 품절 상태인 경우, 품절 버튼을 추가하고 sold-out class를 추가하여 상태를 변경
*/

/*
step3 요구사항
# TODO 웹서버 띄우기

# TODO api 요청
- 서버에 메뉴명 추가를 요청
- 카테고리별 메뉴리스트 불러옴
- 서버에 메뉴 수정을 요청
- 품절상태가 토글될 수 있도록 요청
- 메뉴삭제를 요청

# 리팩토링
- 로컬스토리지에 저장하는 로직 지움
- fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현

# 사용자 경험
- api통신이 실패하는 경우 alert로 예외처리
- 중복되는 메뉴 추가할 수 없게 함
*/
import {$} from './utils/dom.js';
import store from './store/index.js'

const BASE_URL = "http://localhost:3000/api";

const MenuAPI = {
  async getAllmenuByCategory(category){
    const response = await fetch(`${BASE_URL}/category/${category}/menu`);
    return response.json();
  },
  async createMenu(category, name){
    const response = await fetch(`${BASE_URL}/category/${category}/menu`, {
      method: "POST",
      headers : {
        "Content-Type" : "application/json",
      },
      body : JSON.stringify({name}),
    });
    if(!response.ok){
      console.error("에러 발생");
    }
  },
  async updateMenu(category, name, menuId) {
    const response = await fetch(`${BASE_URL}/category/${category}/menu/${menuId}`, {
      method: "PUT",
      headers : {
        "Content-Type" : "application/json",
      },
      body : JSON.stringify({name}),
    });
    if(!response.ok){
      console.error("에러 발생");
    }
    return response.json();
  },
  async toggleSoldOutMenu(category, menuId){
    const response = await fetch(`${BASE_URL}/category/${category}/menu/${menuId}/soldout`, {
      method: "PUT",
    });
    if(!response.ok){
      console.error("에러 발생");
    }
  },
  async deleteMenu(category, menuId) {
    const response = await fetch(`${BASE_URL}/category/${category}/menu/${menuId}`,
    {
      method : "DELETE",
    });
    if(!response.ok){
      console.error("에러 발생");
    };
  },
};


function App() {
  // 상태관리를 위한 menu 배열 선언
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: [],
  };

  this.currentCategory = "espresso";
  // 최초실행시 에스프레소 메뉴 뿌려주는 함수
  this.init = async () => {
    this.menu[this.currentCategory] = await MenuAPI.getAllmenuByCategory(
      this.currentCategory
    );
    // if (store.getLocalStorage()) {
    //   this.menu = store.getLocalStorage();
    // }
    render();
    initEventListener();
  };

  const render = () => {
    console.log(this.menu[this.currentCategory]);
    const template = this.menu[this.currentCategory]
      .map((item, index) => {
        return `<li data-menu-id="${item.menuId}" class="menu-list-item d-flex items-center py-2">
        <span class="w-100 pl-2 menu-name ${item.isSoldOut ? "sold-out" : ""}">${
          item.name
        }</span>
        <button
          type="button"
          class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
        >
        품절
        </button>
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
      </li>`;
      })
      .join(""); // join 메서드 = 배열요소들을 하나의 문자열로 합쳐줌

    $("#menu-list").innerHTML = template;
    updateMenuCount();
  };
  // 총 갯수 업데이트 하는 함수
  const updateMenuCount = () => {
    //const menuCount= $("#menu-list").querySelectorAll("li").length;
    $(".menu-count").innerText = `총 ${
      this.menu[this.currentCategory].length
    }개`;
  };

  // 메뉴 추가하는 함수
  const addMenuName = async () => {
    const MenuName = $("#menu-name").value;
    if (MenuName === "") {
      alert("값을 추가해 주세요");
      return;
    }

    // 메뉴 추가
    await MenuAPI.createMenu(this.currentCategory, menuName);

    // 메뉴 리스트 불러오기
    this.menu[this.currentCategory] = await MenuAPI.getAllmenuByCategory(this.currentCategory);
    render();
    $("#menu-name").value = "";


    /* 로컬 스토리지 사용
    this.menu[this.currentCategory].push({ name: MenuName });
    store.setLocalStorage(this.menu);
    render();
    $("#menu-name").value = "";*/
  };

  // 메뉴 수정하는 함수
  const updateMenuName = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const menuName = e.target.closest("li").querySelector(".menu-name");
    const updatedMenuName = prompt("메뉴명을 수정하세요", menuName.innerText);

    await MenuAPI.updateMenu(this.currentCategory, updatedMenuName, menuId);

    //this.menu[this.currentCategory][menuId].name = updatedMenuName;
    //store.setLocalStorage(this.menu);
    this.menu[this.currentCategory] = await MenuAPI.getAllmenuByCategory(this.currentCategory);
    render();
  };

  // 메뉴 삭제하는 함수
  const deleteMenuName = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    await MenuAPI.deleteMenu(this.currentCategory, menuId);
    this.menu[this.currentCategory] = await MenuAPI.getAllmenuByCategory(this.currentCategory);
    //this.menu[this.currentCategory].splice(menuId, 1);
    //store.setLocalStorage(this.menu);
    render();
  };

  // 품절 처리하는 함수
  const soldOutMenu = async (e) => {
    const menuId = e.target.closest("li").dataset.menuId;

    await MenuAPI.toggleSoldOutMenu(this.currentCategory, menuId);
    this.menu[this.currentCategory] = await MenuAPI.getAllmenuByCategory(this.currentCategory);
    //this.menu[this.currentCategory][menuId].soldOut =
    //  !this.menu[this.currentCategory][menuId].soldOut;
    // store.setLocalStorage(this.menu);
    render();
  };

  const initEventListener = () => {
    // 메뉴 수정 시 menu-list에 아직 자식이 추가되지 않았음으로 이벤트 위임을 통해 전달함
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        // 수정버튼 클릭
        updateMenuName(e);
        return;
      }
      if (e.target.classList.contains("menu-remove-button")) {
        // 삭제 버튼 클릭
        if (confirm("정말 삭제하시겠습니까?")) {
          deleteMenuName(e);
          return;
        }
      }
      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });

    // form 태그 submit 시 새로고침되는 거 막아줌
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("preventDefault 실행");
    });

    // 메뉴 이름 입력 받음
    $("#menu-submit-button").addEventListener("click", addMenuName); // 이벤트를 따로 사용하지 않는 경우 함수명만 파라미터로 넘겨주면 함수의 주소가 바인딩 됨

    $("#menu-form").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });

    // 카테고리 별 클릭 이벤트
    $("nav").addEventListener("click", async (e) => {
      const isCategoryButton =
        e.target.classList.contains("cafe-category-name");
      console.log(isCategoryButton);
      if (isCategoryButton) {
        const categoryName = e.target.dataset.categoryName;
        this.currentCategory = categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        this.menu[this.currentCategory] = await MenuAPI.getAllmenuByCategory(this.currentCategory);
        render();
      }
    });
  };
}

const app = new App();
app.init();
