/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
  // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),

  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElement();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      console.log(thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      //console.log(thisProduct);
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //console.log(thisProduct.element);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElement() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(thisProduct.accordionTrigger)
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log(thisProduct.form)
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log(thisProduct.formInputs)
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log(thisProduct.cartButton)
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log(thisProduct.priceElem)
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      //console.log(thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log(thisProduct.amountWidgetElem);
    }
    initAccordion() {
      const thisProduct = this;
      //console.log(thisProduct);
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.accordionTrigger;
      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        //console.log(thisProduct.element)
        /* find all active products */
        const allActiveProducts = document.querySelectorAll('.product.active');
        /* START LOOP: for each active product */
        for(let activeProduct of allActiveProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if(activeProduct != thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }
      });
    }
    initOrderForm(){
      const thisProduct = this;
      //console.log(thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }


    processOrder(){
      const thisProduct = this; // this wskazuje na całą instancje klasy Product(jedną z 4 powstałych). Każda z metod które piszemy w klasie odnosi sie do kazdej instancji z osobna
      //console.log(thisProduct);
      thisProduct.params = {};
      const formData = utils.serializeFormToObject(thisProduct.form); //generuje obiekt z elementuDOM(form) - nie mam pojecia jak to sie dzieje - powinienem?
      //console.log(formData);
      let price = thisProduct.data.price; //wskazuje na cene w analizowanej instancji
      if(thisProduct.data.params) { //jezeli instancja posiada obiekt params (pierwsza nie posiada wiec jej wgle nie analizujemy bo cena i tak sie nie zmieni)
        for(let param in thisProduct.data.params){ //dla kazdego parametru z obiektu params
          const paramValue = thisProduct.data.params[param]; //wygeneruj wartosc tego parametru(np przy pizzy bedzie to crust/toppings/sauce) i zapisz w stalej paramValue. Operacja jest robiona po to by dostać sie do srodka kazdego z parametrow(jest ich rozna ilosc w zalenosci od instancji).
          //console.log(param);
          //console.log(paramValue);
          for(let option in paramValue.options){//dla kazdej opcji z paramValue.options
            const optionValue = paramValue.options[option]; // dostań sie do kazdej opcji i po to by pozniej na niej operowac
            //console.log(optionValue);
            let formDataParam = formData[param] || [];
            if(formDataParam){//jesli obiekt formData z analizowanym parametrem istnieje - czyli zwraca true
              if(formDataParam.includes(option) && !optionValue.default){ // to sprawdz czy obiekt z tym parametrem zawiera analizowaną opcje i czy w tej opcji jest jest wlasciwosc default jezeli nie ma to z warunku wyjdzie true
                price += optionValue.price; // nalezy dodac wartosc klucza price z obiektu optionValue
                //console.log(formDataParam, option, 'jest');
                if(!formDataParam.includes(option)){
                  price -= optionValue.price;
                }
              } else if(optionValue.default && !formDataParam.includes(option)) { // jezeli obiekt optionValue zawiera w sobie default(istnieje) i obiekt formData z analizowanym parametrem zawiera analizowaną opcje to z warunku wyjdzie true
                price -= optionValue.price; // to od ceny należy odjac wartosc klucza price z obiektu optionValue
                //console.log(formDataParam, option, 'nie ma');
              }
            }
            if(formDataParam && formDataParam.includes(option)){
              if(!thisProduct.params[param]){
                thisProduct.params[param] = {
                  label: paramValue.label,
                  options: {},
                };
              }
              thisProduct.params[param].options[option] = optionValue.label;
              let allImages = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + option);
              //console.log(allImages);
              for (let image of allImages) {
                image.classList.add('active');
              }
            } else {
              let allImages = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + option);
              for (let image of allImages) {
                image.classList.remove('active');
              }
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = thisProduct.price;
      ;

      /*price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price; //wartość generowana po kazdej zmianie checkboxa/selekta/wcisnieciu submita*/
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      console.log(thisProduct.amountWidget);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      //console.log(thisWidget.setValue(thisWidget.input.value))

    //console.log(thisWidget)
    //console.log(element)
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this; // wskazanie na konkretną instancj na której ta metoda powinna być wykonana
      const newValue = parseInt(value); // nowa stała która jest wartością inputa value pobraną z thisWidget.input.value i przekonwertowaną na typ number
      //console.log(thisWidget.value); // thisWidget.value to nic innego jak wartość pobrana z HTML-a z inputu(w przypadku gdy na wcześniejszym etapie była w szablonie), natomist później została dodana jako właściwość .value pobrana z settings.amountWidget.defaultValue, bo została wykasowana z szablonu
      if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){ //sprawdzenie czy na nowa wartość o typie number spełnia konkretne warunki
        thisWidget.value = newValue; // jeżeli warunki są spełnione to do thisWidget.value zostaje przypisana nowa wartość z typem number
        thisWidget.announce(); // jakikolwiek event na dziecku który czeka na wywołanie w rodzicu na konkretnym elemencie
      }
      //console.log(thisWidget.value);
      thisWidget.input.value = thisWidget.value; // przypisanie nowej warotści thisWidget.value do wartości inputa już po przekonwertowaniu na typ number
      //console.log(thisWidget.input.value);
    }

    announce(){
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
      //console.log(event);
    }

    initActions(){
      const thisWidget = this;
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
    }
  }

  class Cart {
    constructor(menuProduct, element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      thisCart.add(menuProduct);

      console.log(thisCart);
    }
    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      console.log(thisCart.dom.productList);
      console.log(thisCart.dom)

    }
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        //console.log(thisCart.dom.wrapper)
      });
    }
    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      const cartContainer = thisCart.dom.productList;
      cartContainer.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM))
      console.log(thisCart.products)
    }
  }
  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this

      thisCartProduct.id = menuProduct.id
      thisCartProduct.name = menuProduct.name
      thisCartProduct.price = menuProduct.price
      thisCartProduct.priceSingle = menuProduct.priceSingle
      thisCartProduct.amount = menuProduct.amount
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params))
      thisCartProduct.getElements(element)
      console.log(thisCartProduct)
    }
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget)
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price)
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit)
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove)
    }
  }

  const app = {

    initMenu: function() {
      const thisApp = this;

      //console.log(thisApp.data);
      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
        //console.log(productData);
        //console.log(thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      console.log(cartElem);
      thisApp.cart =  new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
