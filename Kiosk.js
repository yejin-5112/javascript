$(document).ready(function () {
    function resetCart() {
        $(".cart-items").empty();
        $(".total").text("Total: 0원");
    }

    function resetMenu() {
        $(".menu-item").css("visibility", "visible");
    }

    $(document).on("dragstart", ".menu-item", function (e) {
        e.originalEvent.dataTransfer.setData("text", JSON.stringify({
            name: $(this).data("name"),
            price: Number($(this).data("price"))
        }));
    });

    $(document).on("dragstart", ".cart-item", function (e) {
        e.originalEvent.dataTransfer.setData("text", JSON.stringify({
            name: $(this).data("name"),
            price: Number($(this).data("price"))
        }));
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
        removeItemFromCart(item);
    });

    function addItemToCart(item) {
        const existingItem = $(".cart-items").find(`[data-name='${item.name}']`);
        if (existingItem.length) {
            const quantityEl = existingItem.find(".quantity");
            const quantity = Number(quantityEl.text()) + 1;
            quantityEl.text(quantity);
            updateItemTotal(existingItem, quantity, item.price);
        } else {
            const cartItem = $(`
                <div class="cart-item" draggable="true" data-name="${item.name}" data-price="${item.price}">
                    <span>${item.name}</span>
                    <span class="total-price">${item.price}원</span>
                    <div class="cart-item-buttons">
                        <button class="decrease">-</button>
                        <span class="quantity">1</span>
                        <button class="increase">+</button>
                    </div>
                </div>
            `);
            $(".cart-items").append(cartItem);
            $(`.menu-item[data-name='${item.name}']`).css("visibility", "hidden");
        }
        updateTotal();
    }

    function removeItemFromCart(item) {
        const cartItem = $(".cart-items").find(`[data-name='${item.name}']`);
        if (cartItem.length) {
            cartItem.remove();
            $(`.menu-item[data-name='${item.name}']`).css("visibility", "visible");
        }
        updateTotal();
    }

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

    function updateItemTotal(cartItem, quantity, price) {
        const totalPrice = quantity * price;
        cartItem.find(".total-price").text(`${totalPrice}원`);
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

    $(".pay").on("click", function () {
        if ($(".cart-item").length === 0) {
            alert("장바구니가 비어 있습니다.");
            return;
        }

        let receiptBody = "";
        $(".cart-item").each(function () {
            const name = $(this).data("name");
            const quantity = $(this).find(".quantity").text();
            const price = $(this).find(".total-price").text();
            receiptBody += `<div>${name} x ${quantity} - ${price}</div>`;
        });

        const total = $(".total").text();
        receiptBody += `<div class='receipt-total'>${total}</div>`;

        $(".receipt-body").html(receiptBody);
        $(".receipt").show();
        $(".overlay").show();
    });

    $(".receipt-close").on("click", function () {
        $(".receipt").hide();
        $(".overlay").hide();
        resetCart();
        resetMenu();
    });

    $(".m-settings-btn").on("click", function () {
        $(".admin-panel").show();
        resetCart();
        resetMenu();
    });
    
    $("#close-admin").on("click", function () {
        $(".admin-panel").hide();
    });
    
    $("#menu-image-file").on("change", function () {
        const fileName = $(this).val().split("\\").pop();
        if (fileName) {
            $("#menu-image-url").val(fileName);
        }
    });
    $("#file-selector").on("click", function () {
        const fileInput = $("#menu-image-file");
        if (fileInput.length > 0) {
            fileInput.trigger("click");
        }
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
                $("#menu-name").val('');
                $("#menu-price").val('');
                $("#menu-image-url").val('');
                $("#menu-image-file").val('');
            };
            reader.readAsDataURL(imageFile);
        } else if (imageUrl) {
            imageSrc = imageUrl;
            addMenuItem(name, price, imageSrc);
            $("#menu-name").val('');
            $("#menu-price").val('');
            $("#menu-image-url").val('');
        } else {
            alert("이미지 URL을 입력하거나 파일을 선택하세요.");
        }
    
        $("#menu-name").val('');
        $("#menu-price").val('');
        $("#menu-image-url").val('');
        $("#menu-image-file").val('');
    });
    
    function addMenuItem(name, price, imageSrc) {
        if (!name || !price || !imageSrc) {
            alert("모든 입력란을 필수로 입력하세요.");
            return;
        }
    
        const menuItem = $(
            `<div class="menu-item" draggable="true" data-name="${name}" data-price="${price}">
                <img src="${imageSrc}" alt="${name}">
                <div>${name}<br>${price}원</div>
            </div>`
        );
    
        $(".menu").append(menuItem);
    }

    $(document).on("dblclick", ".menu-item", function () {
        const itemName = $(this).data("name");
        if (confirm(`"${itemName}" 메뉴를 삭제하시겠습니까?`)) {
            $(this).remove();
        }
    });
    
});
