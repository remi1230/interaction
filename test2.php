<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>jQuery UI Autocomplete - Default functionality</title>
  <link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="/resources/demos/style.css">
  <script src="https://code.jquery.com/jquery-3.6.0.js"></script>
  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
  <script>
  $( function() {
    var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $( "#tags" ).autocomplete({
      source: availableTags
    });
    $( "#tags2" ).autocomplete({
      source: availableTags
    });
  } );
  </script>
</head>
<body>


  <div style="margin-top: 25px; padding: 10px; border: 1px gray solid; ">
    <?php
      for($i = 0; $i < 15; $i++){
        print("<p>Lorem ipsum dolorem it sabur al quarani del vordidom plum tales karit samur</p>");
      }
    ?>
  </div>

  <div class="ui-widget">
    <label for="tags">Tags: </label>
    <input id="tags">
  </div>

  <div style="margin-top: 25px; padding: 10px; border: 1px gray solid; ">
    <?php
      for($i = 0; $i < 15; $i++){
        print("<p>Lorem ipsum dolorem it sabur al quarani del vordidom plum tales karit samur</p>");
      }
    ?>
  </div>


  <div class="ui-widget">
    <label for="tags2">Tags: </label>
    <input id="tags2">
  </div>

  <div style="margin-top: 25px; padding: 10px; border: 1px gray solid; ">
    <?php
      for($i = 0; $i < 15; $i++){
        print("<p>Lorem ipsum dolorem it sabur al quarani del vordidom plum tales karit samur</p>");
      }
    ?>
  </div>


</body>
</html>
