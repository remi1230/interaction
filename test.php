
<div>
  <select id='testSelect'>
    <?php
      $names      = ['Angraal', 'Boutrapali', 'Chauvin', 'Chevalier', 'Dupont', 'Echebeche', 'Falzard', 'Gripsou', 'Halnini', 'Koutrapali', 'Lundi', 'Tafforeau', 'Valpoumi', 'Zahani'];
      $firstnames = ['Anne', 'Béatrice', 'Julie', 'Nicolas', 'Athur', 'Bruno', 'Bertrand', 'François', 'Yohanne', 'Zoé', 'Théo', 'Alfred', 'William', 'Vinny'];
      for($i = 0; $i < 100; $i++){
        $name      = $names[random_int(0, count($names) - 1)];
        $firstname = $firstnames[random_int(0, count($firstnames) - 1)];
        $code      = random_int(0, 60000);

        print("<option value='$i'>$firstname $name - $code - option $i</option>");
      }
     ?>
  </select>
</div>
<div style="margin-top: 25px; padding: 10px; border: 1px gray solid; ">
  <?php
    for($i = 0; $i < 15; $i++){
      print("<p>Lorem ipsum dolorem it sabur al quarani del vordidom plum tales karit samur</p>");
    }
  ?>
</div>
<div>
  <select id='testSelect2'>
    <?php
      for($i = 0; $i < 100; $i++){
        $name      = $names[random_int(0, count($names) - 1)];
        $firstname = $firstnames[random_int(0, count($firstnames) - 1)];
        $code      = random_int(0, 60000);

        print("<option value='$i'>$firstname $name - $code - option $i</option>");
      }
     ?>
  </select>
</div>
<div style="margin-top: 25px; padding: 10px; border: 1px gray solid; ">
  <?php
    for($i = 0; $i < 15; $i++){
      print("<p>Lorem ipsum dolorem it sabur al quarani del vordidom plum tales karit samur</p>");
    }
  ?>
</div>

<script
			  src="https://code.jquery.com/jquery-2.2.4.min.js"
			  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
			  crossorigin="anonymous"></script>
 <script>

 document.addEventListener('DOMContentLoaded', function() {
   makeAutoComplete('testSelect');
   makeAutoComplete('testSelect2');
 });

 function makeAutoComplete(selectId, placeholder = 'Taper quelque chose...'){
     let select             = $('#' + selectId);
     let selectContainer    = select.parent();

     selectContainer.attr('style', 'display: grid; grid-template-columns: 60px 0px 200px; ');
     select.attr('style', 'width: 0; height: 0; opacity: 0');

     let selectOptions = [];
     $("#" + selectId + " option").each(function(){
         selectOptions.push({txt: this.text, val: this.value});
     });

     selectContainer.append("<div id='" + selectId + "_autocompleteContainer' style=''><input id='" + selectId + "_autocomplete'></input></div>");

     let inputAutoComplete          = $('#' + selectId + '_autocomplete');
     let inputAutoCompletePos       = inputAutoComplete.position();
     let inputAutoCompleteContainer = $('#' + selectId + '_autocompleteContainer');

     inputAutoCompleteContainer.data('optionSelected', -1);

     inputAutoCompleteContainer.append("<div id='" + selectId + "_autocompleteList' style='position: absolute; '></div>");
     let inputAutoCompleteList = $('#' + selectId + '_autocompleteList');

     let top = parseInt(inputAutoCompletePos.top) + parseInt(inputAutoComplete.css('height'));

     inputAutoCompleteList.css('top',  top + 'px');
     inputAutoCompleteList.css('left', inputAutoCompletePos.left + 'px');
     inputAutoCompleteList.css('backgroundColor', 'white');

     inputAutoComplete.attr('placeholder', placeholder);

     let matchOptions = [];
     inputAutoComplete.keyup(function(e){
         if(e.key != 'ArrowDown' && e.key != 'ArrowUp' && e.key != 'Enter'){
           razList(inputAutoCompleteList);
           let val = this.value;
           if(val.length > 0){
               matchOptions = [];
               selectOptions.forEach(function(option){
                   let optionTxt = option.txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                   let valTxt    = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                   if(optionTxt.includes(valTxt)){ matchOptions.push(option); };
               });

               if(matchOptions.length > 0){
                 inputAutoCompleteList.css('border', '1px grey solid');
                  if(matchOptions.length > 20){
                    inputAutoCompleteList.css('height', '660px');
                    inputAutoCompleteList.css('overflowY', 'scroll');
                  }
                  else{
                    inputAutoCompleteList.css('height', '');
                    inputAutoCompleteList.css('overflowY', '');
                  }

                   let style = "padding: 7px; ";
                   style    += "border-bottom: 1px grey solid; ";
                   style    += "border-radius: 0px; ";
                   style    += "cursor: pointer; ";
                   style    += "height: 18px; ";

                   let first = true;
                   matchOptions.forEach(function(matchOption){
                       let toAppend = "<div class='matchOption' id='" + selectId + "_option_" + matchOption.val + "' style='" + style + "' value='" + matchOption.val + "'>" + matchOption.txt + "</div>";
                       inputAutoCompleteList.append(toAppend);

                       let optionClicked = $("#" + selectId + "_option_" + matchOption.val);
                       optionClicked.mousedown(function(){
                           select.val(optionClicked.attr('value'));
                           inputAutoComplete.val(optionClicked.text());

                           razList(inputAutoCompleteList);
                           select.trigger('change');
                       });

                       inputAutoCompleteList.fadeIn(250);

                       optionClicked.hover(
                           function() {
                               $(this).css('boxShadow', '1px 1px 3px 1px grey');
                           }, function() {
                               $(this).css('boxShadow', '');
                           }
                       );
                   });
               }
           }
         }
         else if(e.key == 'ArrowDown'){
           let numOptionToSelect = inputAutoCompleteContainer.data('optionSelected');

           if(numOptionToSelect < matchOptions.length){
             numOptionToSelect++;

             if(!matchOptions[numOptionToSelect]){
               numOptionToSelect = 0;
               $("#" + selectId + "_option_" + matchOptions[matchOptions.length - 1].val).css('boxShadow', '');
             }

             $("#" + selectId + "_option_" + matchOptions[numOptionToSelect].val).css('boxShadow', '1px 1px 3px 1px grey');
             if(matchOptions[numOptionToSelect - 1]){ $("#" + selectId + "_option_" + matchOptions[numOptionToSelect - 1].val).css('boxShadow', ''); }
             inputAutoCompleteContainer.data('optionSelected', numOptionToSelect);
           }
         }
         else if(e.key == 'ArrowUp'){
           let numOptionToSelect = inputAutoCompleteContainer.data('optionSelected');

           if(numOptionToSelect > 0){
             numOptionToSelect--;

             $("#" + selectId + "_option_" + matchOptions[numOptionToSelect].val).css('boxShadow', '1px 1px 3px 1px grey');
             if(matchOptions[numOptionToSelect + 1]){ $("#" + selectId + "_option_" + matchOptions[numOptionToSelect + 1].val).css('boxShadow', ''); }
             inputAutoCompleteContainer.data('optionSelected', numOptionToSelect);
           }
           else{
             $("#" + selectId + "_option_" + matchOptions[0].val).css('boxShadow', '')
             inputAutoCompleteContainer.data('optionSelected', -1);
           }
         }
         else if(e.key == 'Enter' && matchOptions[inputAutoCompleteContainer.data('optionSelected')]){
           $("#" + selectId + "_option_" + matchOptions[inputAutoCompleteContainer.data('optionSelected')].val).trigger('mousedown');
         }
     });
     inputAutoComplete.click(function(){
       razList(inputAutoCompleteList);
       inputAutoComplete.val('');
     });
     inputAutoComplete.blur(function(event){
       razList(inputAutoCompleteList);
     });

     function razList($list){
       inputAutoCompleteContainer.data('optionSelected', -1);
       $list.empty();
       $list.css('height', '');
       $list.css('overflowY', '');
       $list.css('border', '');
       $list.css('display', 'none');
     }
  }
 </script>
