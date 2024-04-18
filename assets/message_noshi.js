function select_text_if_default(textarea) {
  const default_texts = [
    '大切な方へのメッセージをご入力下さい。',   // message card
    '贈り主様のお名前をご記入下さい。'         // noshi from
  ];
  if (default_texts.indexOf(textarea.value) >= 0) {
    textarea.select();
  }
}

function show_message_card_section() {
    document.querySelector('#cart-gift-message-lable').style.display = 'block';
    var gift_message_text = document.querySelector('#cart-gift-message')
    gift_message_text.style.display = 'block';
    gift_message_text.value = gift_message_text.value.replaceAll('<br />', '\n').trim();
    if (gift_message_text.value.trim() == '') {
        gift_message_text.value = '大切な方へのメッセージをご入力下さい。';
    }
    hide_noshi_section();
}

function show_noshi_section() {
  var noshi_type = document.querySelector('#cart-noshi-type');
  noshi_type.style.display = 'block';
  document.querySelector('#cart-noshi-type-lable').style.display = 'block';
  var noshi_from_type = document.querySelector('#cart-noshi-from-type');
  noshi_from_type.style.display = 'block';
  document.querySelector('#cart-noshi-from-type-lable').style.display = 'block';
  if (noshi_type.value.trim() == '') {
      noshi_type.value = '御祝';
  }
  if (noshi_from_type.value.trim() == '') {
      noshi_from_type.value = 'なし';
  }
  show_noshi_type_other_section();
  show_noshi_from_section();
  hide_message_section();
}

function show_noshi_type_other_section() {
  if (document.querySelector('#cart-noshi-type').value == 'その他') {
    var noshi_type_other = document.querySelector('#cart-noshi-type-other');
    noshi_type_other.style.display = 'block';
  } else {
    document.querySelector('#cart-noshi-type-other').style.display = 'none';
  }
}

function show_noshi_from_section() {
  if (document.querySelector('#cart-noshi-from-type').value == 'あり') {
    document.querySelector('#cart-noshi-from-text-lable').style.display = 'block';
    var noshi_from_text = document.querySelector('#cart-noshi-from-text');
    noshi_from_text.style.display = 'block';
    noshi_from_text.value = noshi_from_text.value.replaceAll('<br />', '\n').trim();
    if (noshi_from_text.value.trim() == '') {
      noshi_from_text.value = '贈り主様のお名前をご記入下さい。';
    }
  } else {
    document.querySelector('#cart-noshi-from-text-lable').style.display = 'none';
    document.querySelector('#cart-noshi-from-text').style.display = 'none';
  }
}

function hide_message_section() {
  document.querySelector('#cart-gift-message-lable').style.display = 'none';
  document.querySelector('#cart-gift-message').style.display = 'none';
}

function hide_noshi_section() {
  document.querySelector('#cart-noshi-type-lable').style.display = 'none';
  document.querySelector('#cart-noshi-type').style.display = 'none';
  document.querySelector('#cart-noshi-from-type-lable').style.display = 'none';
  document.querySelector('#cart-noshi-from-type').style.display = 'none';
  document.querySelector('#cart-noshi-from-text-lable').style.display = 'none';
  document.querySelector('#cart-noshi-from-text').style.display = 'none';
}

function clear_message_noshi_values() {
  switch (document.querySelector('#card-selection').value) {
    case "なし":
      clear_message_values();
      clear_noshi_values();
      break;
    case "メッセージカード":
      clear_noshi_values();
      break;
    case "のし":
      clear_message_values();
  }
}

function clear_message_values() {
  document.querySelector('#cart-gift-message').value = '';
}

function clear_noshi_values() {
  document.querySelector('#cart-noshi-type').value = '';
  document.querySelector('#cart-noshi-type-other').value = '';
  document.querySelector('#cart-noshi-from-type').value = '';
  document.querySelector('#cart-noshi-from-text').value = '';
}

function get_message_or_noshi_cart_attributes() {
  var res = {'メッセージカード/のし': document.querySelector('#card-selection').value};
  switch (res['メッセージカード/のし']) {
    case 'メッセージカード':
      res['ギフトカードメッセージ'] = document.querySelector('#cart-gift-message').value;
      break;
    case 'のし':
      res['のし表書'] = document.querySelector('#cart-noshi-type').value
      if (res['のし表書'] == 'その他') {
        res['のし表書 (その他)'] = document.querySelector('#cart-noshi-type-other').value;
      }
      res['のし名入れ有無'] = document.querySelector('#cart-noshi-from-type').value;
      if (res['のし名入れ有無'] == 'あり') {
        res['のし名入れ'] = document.querySelector('#cart-noshi-from-text').value
      }
      break;
  }
  return res;
}

async function _update_message_or_noshi_cart_attributes() {
  var attribute_values = get_message_or_noshi_cart_attributes();
  var request = new XMLHttpRequest();
  request.onerror = function() {
    return console.log(request.statusText + ": cart note update request failed!");
  };
  console.log(`updating cart attributes: ${JSON.stringify(attribute_values)}`);
  request.open("POST", theme.urls.cart + "/update.js");
  request.setRequestHeader('Content-Type', 'application/json');
  return request.send(JSON.stringify({
    attributes: attribute_values
  }));
}

async function update_message_or_noshi_cart_attributes() {
  return await _update_message_or_noshi_cart_attributes();
}


var ready = (callback) => {
  if (document.readyState != "loading") callback();
  else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {
  var cs = document.querySelector('#card-selection');
  if (cs){
    switch (cs.value) {
      case 'メッセージカード':
        show_message_card_section();
        break;
      case 'のし':
        show_noshi_section();
        break
      default:
        hide_message_section();
        hide_noshi_section();
    }
  }
  document.querySelector('body').addEventListener('change', event => {
    if (event.target.matches('#card-selection')){
      switch (event.target.value) {
        case 'メッセージカード':
          show_message_card_section();
          break;
        case 'のし':
          show_noshi_section();
          break
        default:
          hide_message_section();
          hide_noshi_section();
      }
    } else if (event.target.matches('#cart-noshi-type')) {
        show_noshi_type_other_section();
    } else if (event.target.matches('#cart-noshi-from-type')) {
        show_noshi_from_section();
    }
  });
  document.querySelector('body').addEventListener('submit', event => {
    if (event.target.matches('form.cart--form')){   // <form class="cart--form"> rendered by shopify
      clear_message_noshi_values();
    }
  });
  document.querySelector('body').addEventListener('click', event => {
    if (['ShopifyPay-button', 'GooglePay-button', 'ApplePay-button'].some(
      (testid) => event.target.closest(`[data-testid='${testid}']`))) {
      clear_message_noshi_values();
      var res = update_message_or_noshi_cart_attributes();
      console.log(`in event listener: ${res}`);
    }
  }, {capture: true});
});
