function updateSlider(element) {
  var curVal = element.value, val = (curVal - 1) * 50;

  const previousSiblings = (elem) => {
    let siblings = [];
    while (elem = elem.previousElementSibling) {
        siblings.push(elem);
      }
    return siblings;
  };

  [].forEach.call(element.parentElement.parentElement.querySelectorAll('li'), (list) =>
   {
     list.classList.remove("Active", "Selected");
   });

  var curLabel = element.parentElement.parentElement.querySelector('.range-labels li:nth-child(' + curVal + ')')
  curLabel.classList.add("Active", "Selected");
  const previousLabels = previousSiblings(curLabel);
  previousLabels.forEach( label => label.classList.add("Selected"));

  element.parentElement.style.background = 'linear-gradient(to right, #37adbf 0%, #37adbf ' + val + '%, #fff ' + val + '%, #fff 100%';
}

(function initAndSetupTheSliders() {
    [].forEach.call(document.getElementsByClassName("range-container"), function(el) {
      var inputs = [].slice.call(el.querySelectorAll('.range input'));
      inputs.forEach( input => {
              updateSlider(input);
          input.addEventListener('input', function (element) {
              updateSlider(input);
          });
          input.addEventListener('change', function (element) {
              updateSlider(input);
          });
      });
    });
}());
