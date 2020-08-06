import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../Components/AmountWidget.js';

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

  }
  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
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


    /*price *= thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = price; //wartość generowana po kazdej zmianie checkboxa/selekta/wcisnieciu submita*/
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    //console.log(thisProduct.amountWidget);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
