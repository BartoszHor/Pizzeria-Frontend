/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();


      console.log(thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      console.log(thisProduct);
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      console.log(thisProduct.element);
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
      console.log(thisProduct.imageWrapper);
    }
    initAccordion() {
      const thisProduct = this;
      console.log(thisProduct);
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
      console.log(thisProduct);

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
      });
    }
    processOrder(){
      const thisProduct = this; // this wskazuje na całą instancje klasy Product(jedną z 4 powstałych). Każda z metod które piszemy w klasie odnosi sie do kazdej instancji z osobna
      console.log(thisProduct);
      const formData = utils.serializeFormToObject(thisProduct.form); //generuje obiekt z elementuDOM(form) - nie mam pojecia jak to sie dzieje - powinienem?
      console.log(formData);
      let price = thisProduct.data.price; //wskazuje na cene w analizowanej instancji
      if(thisProduct.data.params) { //jezeli instancja posiada obiekt params (pierwsza nie posiada wiec jej wgle nie analizujemy bo cena i tak sie nie zmieni)
        for(let param in thisProduct.data.params){ //dla kazdego parametru z obiektu params
          const paramValue = thisProduct.data.params[param]; //wygeneruj wartosc tego parametru(np przy pizzy bedzie to crust/toppings/sauce) i zapisz w stalej paramValue. Operacja jest robiona po to by dostać sie do srodka kazdego z parametrow(jest ich rozna ilosc w zalenosci od instancji).
          console.log(param);
          console.log(paramValue);
          for(let option in paramValue.options){//dla kazdej opcji z paramValue.options
            const optionValue = paramValue.options[option]; // dostań sie do kazdej opcji i po to by pozniej na niej operowac
            if(formData[param]){//jesli obiekt formData z analizowanym parametrem istnieje - czyli zwraca true
              if(formData[param].includes(option) && !optionValue.default){ // to sprawdz czy obiekt z tym parametrem zawiera analizowaną opcje i czy w tej opcji jest jest wlasciwosc default jezeli nie ma to z warunku wyjdzie true
                price += optionValue.price; // nalezy dodac wartosc klucza price z obiektu optionValue
                console.log(formData[param], option, 'jest');
              } else if(optionValue.default && !formData[param].includes(option)) { // jezeli obiekt optionValue zawiera w sobie default(istnieje) i obiekt formData z analizowanym parametrem zawiera analizowaną opcje to z warunku wyjdzie true
                price -= optionValue.price; // to od ceny należy odjac wartosc klucza price z obiektu optionValue
                console.log(formData[param], option, 'nie ma');
              }
            }
            if(formData[param].includes(option)){
              let allImages = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + option);
              console.log(allImages)
              for (let image of allImages) {
                image.classList.add('active');
              }
            } else if(!formData[param].includes(option)) {
              let allImages = thisProduct.imageWrapper.querySelectorAll('.' + param + '-' + option);
              for (let image of allImages) {
                image.classList.remove('active');
              }
            }
          }
        }
      }
      thisProduct.priceElem.innerHTML = price; //wartość generowana po kazdej zmianie checkboxa/selekta/wcisnieciu submita
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;

      console.log(thisApp.data);
      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
        console.log(productData);
        console.log(thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
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
    },
  };

  app.init();
}
