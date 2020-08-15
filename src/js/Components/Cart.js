import CartProduct from '../Components/CartProduct.js';
import utils from '../utils.js';
import {select, classNames, settings, templates} from '../settings.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    console.log(thisCart);

  }
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }


  }
  initActions(){
    const thisCart = this;

    thisCart.dom.form.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
  }

  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }

  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    const cartContainer = thisCart.dom.productList;
    cartContainer.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update(){
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;

    for (let key of thisCart.renderTotalKeys){
      for (let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: 'test',
      totalPrice: thisCart.totalPrice,
      phone: thisCart.dom.phone.value,
      mail: thisCart.dom.address.value,
      deliveryFee: thisCart.deliveryFee,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      products: [],
    };
    for(let pickedProduct of thisCart.products) {
      payload.products.push(pickedProduct.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log(parsedResponse);
      });
  }

}

export default Cart;
