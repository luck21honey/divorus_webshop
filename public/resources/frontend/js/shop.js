if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

//Handle Stripe Payment
function handleStripePayment() {
    window.location = './stripe_payment';
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'en',
    token: function (token) {
        var items = []
        var cartItemContainer = document.getElementsByClassName('cart-items')[0]
        var cartRows = cartItemContainer.getElementsByClassName('cart-row')
        for (var i = 0; i < cartRows.length; i++) {
            var cartRow = cartRows[i]
            var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
            var quantity = quantityElement.value
            var id = cartRow.dataset.itemId
            var nameElement = cartRow.getElementsByClassName('cart-item-title')[0]
            var name = nameElement.value
            items.push({
                id: id,
                name: name,
                quantity: quantity
            })

        }

        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function (res) {
            return res.json()
        }).then(function (data) {
            alert(data.message)
            var cartItems = document.getElementsByClassName('cart-items')[0]
            while (cartItems.hasChildNodes()) {
                cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
        }).catch(function (error) {
            console.error(error)
        })
    }
})

function purchaseClicked() {
    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price = parseFloat(priceElement.innerText.replace('$', '')) * 100
    stripeHandler.open({
        amount: price,
        adress: ''
    })
}


function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove();

    // get product id
    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    // remove cart
    var cartData = JSON.parse(localStorage.getItem("cartData"));
    var updatedCartData = [];
    for (var i = 0; i < cartData.length; i++) {
        if (cartData[i].id !== id) {
            updatedCartData.push(cartData[i]);
        }
    }
    localStorage.setItem("cartData", JSON.stringify(updatedCartData));

    updateCartTotal()
}



function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement

    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price1')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var quantidade = shopItem.getElementsByClassName('quantity')[0]
    var quantidade2 = quantidade.value
    var description = shopItem.getElementsByClassName('shop-item-description')[0].innerText

    var priceInt = parseInt(String(price).substr(1))
    var totalPrice = priceInt*quantidade2;

    // get id
    // var id = shopItem.getElementsByClassName('shop-item-price1')[0].getAttribute("id");
    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    addItemToCart(title, price, imageSrc, quantidade2, id, description, totalPrice)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, quantidade2, id, description, totalPrice) {
    var cartRow = document.createElement('div')

    cartRow.dataset.itemId = id
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0];
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title');


    for (var i = 0; i < cartItemNames.length; i++) {
        if ((cartItemNames[i].getAttribute('id') == id + '_item')) {
            alert('This item is already added to the cart')
            return
        }
    }

    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="200" height="250">
            <br>
            <span id="${id}_item" class="cart-item-title">${title}</span>
        </div>
        Price: <span class="cart-price cart-column">${price}</span><br>
		
        <div class="cart-quantity cart-column">
        
            <input class="cart-quantity-input" value="${quantidade2}">
            
        
        
            
            <button class="btn btn-danger" type="button">Remover</button>
        </div>`;

    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)

    // save cart data to local storage : title, price, imageSrc, quantidade2, id
    var cartItem = {
        id: id,
        title: title,
        desc: description,
        price: price,
        totalPrice: totalPrice,
        imageSrc: imageSrc,
        quantity: quantidade2
    }
    var cartData = JSON.parse(localStorage.getItem("cartData"));
    // check cart data exist
    var exitCart = false;
    for (var i = 0; i < cartData.length; i++) {
        if (cartData[i].id === id) {
            cartData[i] = cartItem;
            exitCart = true;
        }
    }
    if (!exitCart) {
        cartData.push(cartItem);
    }
    
    localStorage.setItem("cartData", JSON.stringify(cartData));

    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]

        var price = parseFloat(priceElement.innerText.replace('€', ''))

        total = total + price
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '€' + getTotalPrice();
}

function getTotalPrice() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')

    var total_price = [];
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]

        var price = priceElement.innerHTML.replace(/[^0-9]/gi, '');
        price = price / 100;

        var quantity = quantityElement.value
        var id = cartRow.dataset.itemId
        var nameElement = cartRow.getElementsByClassName('cart-item-title')[0]
        var name = nameElement.innerHTML;

        var item_price = parseFloat(price) * parseInt(quantity);
        total_price.push(item_price);
    }

    var sum = total_price.reduce(function (a, b) {
        return a + b;
    }, 0);

    return sum.toFixed(2);
}




function obterPreço() {
    var cartItemContainer2 = document.getElementsByClassName('shop-items')[0]
    var cartRows2 = cartItemContainer2.getElementsByClassName('Produtos')
    var total2 = 0
    for (var i = 0; i < cartRows2.length; i++) {
        var cartRow2 = cartRows2[i]
        var preço = cartRow2.getElementsByClassName('priceCell')[0]
        var quantidade = cartRow2.getElementsByClassName('quantity')[0]
        var quantity = quantidade.value
        var price = parseFloat(preço.innerText.replace('$', ''))
        total2 = price * quantity
        if (quantidade < 1)
            return

        console.log(total2)

        cartRow2.getElementsByClassName('shop-item-price1')[0].innerHTML = '€' + total2

    }
}
