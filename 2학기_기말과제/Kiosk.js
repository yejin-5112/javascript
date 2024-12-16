$(document).ready(function () {
    let defaultMenuData = [
        { name: "짜장면", price: 7000, imageSrc: "img/짜장면.png" },
        { name: "고기짬뽕", price: 8000, imageSrc: "img/고기짬뽕.png" },
        { name: "해물짬뽕", price: 8000, imageSrc: "img/해물짬뽕.png" },
        { name: "탕수육", price: 10000, imageSrc: "img/탕수육.png" },
        { name: "칠리새우", price: 12000, imageSrc: "img/칠리새우.png" },
        { name: "멘보샤", price: 5000, imageSrc: "img/멘보샤.png" },
        { name: "고기만두", price: 4000, imageSrc: "img/고기만두.png" },
        { name: "김치만두", price: 4000, imageSrc: "img/김치만두.png" },
        { name: "후라이드치킨", price: 8500, imageSrc: "img/후라이드치킨.png" },
        { name: "양념치킨", price: 9000, imageSrc: "img/양념치킨.png" }
    ];

    let paymentHistory = JSON.parse(localStorage.getItem("paymentHistory")) || [];
    let accumulatedSales = JSON.parse(localStorage.getItem("accumulatedSales")) || 0;
    let menuData = JSON.parse(localStorage.getItem("menuData"));

    if (!menuData || menuData.length === 0) {
        menuData = defaultMenuData;
        localStorage.setItem("menuData", JSON.stringify(menuData));
    }

    function updateLocalStorage() {
        localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
        localStorage.setItem("accumulatedSales", JSON.stringify(accumulatedSales));
        localStorage.setItem("menuData", JSON.stringify(menuData));
    }

    function renderMenu() {
        $(".menu").empty();
        menuData.forEach((item) => {
            const menuItem = `
                <div class="menu-item" draggable="true" data-name="${item.name}" data-price="${item.price}">
                    <img src="${item.imageSrc}" alt="${item.name}">
                    <div>${item.name}<br>${item.price}원</div>
                </div>`;
            $(".menu").append(menuItem);
        });
    }

    function resetCart() {
        $(".cart-items").empty();
        $(".total").text("Total: 0원");
    }

    function resetMenuVisibility() {
        $(".menu-item").css("visibility", "visible");
    }

    function updateTotal() {
        let total = 0;
        $(".cart-item").each(function () {
            const quantity = Number($(this).find(".quantity").text());
            const price = Number($(this).data("price"));
            total += quantity * price;
        });
        $(".total").text(`Total: ${total}원`);
    }

    function addItemToCart(item) {
        const existingItem = $(".cart-items").find(`[data-name='${item.name}']`);
        if (existingItem.length) {
            const quantityEl = existingItem.find(".quantity");
            const quantity = Number(quantityEl.text()) + 1;
            quantityEl.text(quantity);
            updateItemTotal(existingItem, quantity, item.price);
        } else {
            const cartItem = `
                <div class="cart-item" data-name="${item.name}" data-price="${item.price}" draggable="true">
                    <span>${item.name}</span>
                    <span class="total-price">${item.price}원</span>
                    <div class="cart-item-buttons">
                        <button class="decrease">-</button>
                        <span class="quantity">1</span>
                        <button class="increase">+</button>
                    </div>
                </div>`;
            $(".cart-items").append(cartItem);
            $(".menu-item").filter(`[data-name='${item.name}']`).css("visibility", "hidden");
        }
        updateTotal();
    }

    function updateItemTotal(cartItem, quantity, price) {
        const totalPrice = quantity * price;
        cartItem.find(".total-price").text(`${totalPrice}원`);
    }

    $(document).on("dragstart", ".menu-item", function (e) {
        const item = {
            name: $(this).data("name"),
            price: $(this).data("price")
        };
        e.originalEvent.dataTransfer.setData("text", JSON.stringify(item));
    });

    $(document).on("dragstart", ".cart-item", function (e) {
        const item = {
            name: $(this).data("name"),
            price: $(this).data("price")
        };
        e.originalEvent.dataTransfer.setData("text", JSON.stringify(item));
    });

    $(".cart").on("dragover", function (e) {
        e.preventDefault();
    });

    $(".cart").on("drop", function (e) {
        e.preventDefault();
        const item = JSON.parse(e.originalEvent.dataTransfer.getData("text"));
        addItemToCart(item);
    });

    $(".menu").on("dragover", function (e) {
        e.preventDefault();
    });

    $(".menu").on("drop", function (e) {
        e.preventDefault();
        const item = JSON.parse(e.originalEvent.dataTransfer.getData("text"));
        const cartItem = $(".cart-items").find(`[data-name='${item.name}']`);
        if (cartItem.length) {
            cartItem.remove();
            updateTotal();
        }
        $(".menu-item").filter(`[data-name='${item.name}']`).css("visibility", "visible");
    });

    $(document).on("click", ".increase", function () {
        const cartItem = $(this).closest(".cart-item");
        const quantityEl = cartItem.find(".quantity");
        const price = Number(cartItem.data("price"));
        const quantity = Number(quantityEl.text()) + 1;
        quantityEl.text(quantity);
        updateItemTotal(cartItem, quantity, price);
        updateTotal();
    });

    $(document).on("click", ".decrease", function () {
        const cartItem = $(this).closest(".cart-item");
        const quantityEl = cartItem.find(".quantity");
        const price = Number(cartItem.data("price"));
        let quantity = Number(quantityEl.text());
        
        if (quantity > 1) {
            quantity -= 1;
            quantityEl.text(quantity);
            updateItemTotal(cartItem, quantity, price);
            updateTotal();
        }
    });

    $(".pay").on("click", function () {
        if ($(".cart-item").length === 0) {
            alert("장바구니가 비어 있습니다.");
            return;
        }
    
        const userConfirmed = confirm("결제 하시겠습니까?");
        if (!userConfirmed) {
            return;
        }
    
        let currentTransaction = [];
        let total = 0;
        let receiptBody = "";
    
        $(".cart-item").each(function () {
            const name = $(this).data("name");
            const quantity = $(this).find(".quantity").text();
            const price = Number($(this).data("price")) * Number(quantity);
            total += price;
            currentTransaction.push({ name, quantity, price });
            receiptBody += `<div>${name} x ${quantity} - ${price.toLocaleString()}원</div>`;
        });
    
        const now = new Date();
        const formattedTime = now.toLocaleString();
    
        paymentHistory.push({ time: formattedTime, transaction: currentTransaction, total });
        accumulatedSales += total;
    
        updateLocalStorage();
    
        receiptBody += `<div class="receipt-total">총 합계: ${total.toLocaleString()}원</div>`;
        $(".receipt-body").html(receiptBody);
    
        $(".receipt").show();
        $(".overlay").show();
    });
    

    $(".receipt-close").on("click", function () {
        $(".receipt").hide();
        $(".overlay").hide();
        resetCart();
        resetMenuVisibility();
    });

    $(".payment-history-btn").on("click", function () {
        if (paymentHistory.length === 0) {
            alert("결제 내역이 없습니다.");
            return;
        }

        let historyContent = `<div><strong>전체 매출: ${accumulatedSales.toLocaleString()}원</strong></div><hr>`;
        paymentHistory.forEach((record) => {
            historyContent += `<div><strong>${record.time}</strong></div>`;
            record.transaction.forEach(item => {
                historyContent += `<div>${item.name} x ${item.quantity} - ${item.price}원</div>`;
            });
            historyContent += `<div class="payment-history-total">총 금액: ${record.total.toLocaleString()}원</div>`;
            historyContent += "<hr>";
        });

        $(".payment-history-body").html(historyContent);
        $(".payment-history").css("display", "block");
    });

    $(".payment-history-close").on("click", function () {
        $(".payment-history").css("display", "none");
    });

    $(".payment-history-reset").on("click", function () {
        if (confirm("결제 내역을 초기화하시겠습니까?")) {
            paymentHistory = [];
            accumulatedSales = 0;
            updateLocalStorage();
            $(".payment-history-body").html(`<div style="text-align: center; color: #f34643;"><strong>결제 내역이 초기화 되었습니다.</strong></div>`);
        }
    });

    $(".m-settings-btn").on("click", function () {
        $(".admin-panel").show();
    });

    $("#close-admin").on("click", function () {
        $(".admin-panel").hide();
    });

    $("#file-selector").on("click", function () {
        $("#menu-image-file").click();
    });

    $("#menu-image-file").on("change", function () {
        const fileName = $(this).val().split("\\").pop();
        $("#menu-image-url").val(fileName);
    });

    $("#admin-form").on("submit", function (e) {
        e.preventDefault();

        const name = $("#menu-name").val();
        const price = $("#menu-price").val();
        const imageUrl = $("#menu-image-url").val();
        const imageFile = $("#menu-image-file")[0].files[0];

        let imageSrc = "";

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function (event) {
                imageSrc = event.target.result;
                addMenuItem(name, price, imageSrc);
            };
            reader.readAsDataURL(imageFile);
        } else if (imageUrl) {
            imageSrc = imageUrl;
            addMenuItem(name, price, imageSrc);
        } else {
            alert("이미지 URL을 입력하거나 파일을 선택하세요.");
        }

        $("#menu-name").val('');
        $("#menu-price").val('');
        $("#menu-image-url").val('');
        $("#menu-image-file").val('');
    });

    function addMenuItem(name, price, imageSrc) {
        const newItem = { name, price, imageSrc };
        menuData.push(newItem);
        updateLocalStorage();
        renderMenu();
    }

    $(document).on("dblclick", ".menu-item", function () {
        const itemName = $(this).data("name");
    
        if (confirm(`"${itemName}" 메뉴를 삭제하시겠습니까?`)) {
            menuData = menuData.filter(item => item.name !== itemName);
    
            updateLocalStorage();
            renderMenu();
        }
    });
    
    renderMenu();
});
