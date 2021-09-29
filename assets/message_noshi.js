function show_message_card_section() {
    $('#cart-gift-message').css({ 'display': 'block' });
    $('#cart-gift-message-lable').css({ 'display': 'block' });
    if ($('#cart-gift-message').val().trim() == "") {
        $('#cart-gift-message').val("大切な方へのメッセージをご入力下さい。");
    }
    hide_noshi_section();
}

function show_noshi_section() {
    $('#cart-noshi-type').css({'display': 'block'});
    $('#cart-noshi-type-lable').css({'display': 'block'});
    $('#cart-noshi-from-type').css({'display': 'block'});
    $('#cart-noshi-from-type-lable').css({'display': 'block'});
    if ($('#cart-noshi-type option:selected').val().trim() == "") {
        $('#cart-noshi-type').val("御祝");
    }
    if ($('#cart-noshi-from-type option:selected').val().trim() == "") {
        $('#cart-noshi-from-type').val("なし");
    }
    show_noshi_from_section();
    hide_message_section();
}

function show_noshi_from_section() {
    if ($('#cart-noshi-from-type').val() == "あり") {
        $('#cart-noshi-from-text-lable').css({'display': 'block'});
        $('#cart-noshi-from-text').css({'display': 'block'});
        if ($('#cart-noshi-from-text').val().trim() == "") {
            $('#cart-noshi-from-text').val("贈り主様のお名前をご記入下さい。");
        }
    } else {
        $('#cart-noshi-from-text-lable').css({'display': 'none'});
        $('#cart-noshi-from-text').css({'display': 'none'});        
    }
}

function hide_message_section() {
    $('#cart-gift-message').css({ 'display': 'none' });
    $('#cart-gift-message-lable').css({ 'display': 'none' });
}

function hide_noshi_section() {
    $('#cart-noshi-type-lable').css({ 'display': 'none' });
    $('#cart-noshi-type').css({ 'display': 'none' });
    $('#cart-noshi-from-type-lable').css({ 'display': 'none' });
    $('#cart-noshi-from-type').css({ 'display': 'none' });
    $('#cart-noshi-from-text-lable').css({ 'display': 'none' });
    $('#cart-noshi-from-text').css({ 'display': 'none' });    
}

function clear_message_noshi_values() {
  switch ($('#card-selection').val()) {
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
  $('#cart-gift-message').val("");
}
function clear_noshi_values() {
  $('#cart-noshi-type').val("");
  $('#cart-noshi-from-type').val("");
  $('#cart-noshi-from-text').val("");
}

$(document).ready(function () {
    if ($('#card-selection').val() == 'メッセージカード') {
        show_message_card_section();
    } else if ($('#card-selection').val() == 'のし') {
        show_noshi_section();
    }
    $('body').on('change', '#card-selection', function() {
      switch ($(this).val()) {
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
    });
    $('body').on('change', '#cart-noshi-from-type', function() {
        show_noshi_from_section();
    });
    $('body').on('submit', '.cart--form', function(event) {    // shopify renders form class="cart--form"
      clear_message_noshi_values();
    });
});
