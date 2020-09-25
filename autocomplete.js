$(document).ready(function() {
  $("input#q").autocomplete({
    source: function(request, response) {
      $.ajax({
        url: "get_list.php",
        dataType: "json",
        data: {
          term : request.term,
          advanced : $("#ad :selected").text()

        },
        success: function(data) {
          response(data);

        }

      });

    }    

  });

});

