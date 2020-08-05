import {select, settings} from '../settings.js';
class AmountWidget {
  constructor(element){
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
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
    const event = new CustomEvent('updated', {
      bubbles: true
    });
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

export default AmountWidget;
