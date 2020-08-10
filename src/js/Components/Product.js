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
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;
    const clickableTrigger = thisProduct.accordionTrigger;
    clickableTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      const allActiveProducts = document.querySelectorAll('.product.active');
      for(let activeProduct of allActiveProducts) {
        if(activeProduct != thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }
    });
  }

  initOrderForm(){
    const thisProduct = this;

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
    const thisProduct = this;
    thisProduct.params = {};
    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;
    if(thisProduct.data.params) {
      for(let param in thisProduct.data.params){
        const paramValue = thisProduct.data.params[param];
        for(let option in paramValue.options){
          const optionValue = paramValue.options[option];
          let formDataParam = formData[param] || [];
          if(formDataParam){
            if(formDataParam.includes(option) && !optionValue.default){
              price += optionValue.price;
              if(!formDataParam.includes(option)){
                price -= optionValue.price;
              }
            } else if(optionValue.default && !formDataParam.includes(option)) {
              price -= optionValue.price;
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
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
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
