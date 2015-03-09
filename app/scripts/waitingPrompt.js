!function ( $ ) {

    /* WaitingPrompt PLUGIN DEFINITION
    * ============================= */

    $.waitingPrompt = {
        show: function ( selector, promptText ) {
            var $this = $( selector )
              , backdrop = '<div class="backdrop"></div>'
              , prompt = '<div class="loading">' + promptText + '</div>';

            $this.css( 'position', 'relative' ).append( backdrop + prompt );
            var $prompt = $this.find( '.loading' );
            $prompt.css( 'left', ( $this.outerWidth() - $prompt.outerWidth() ) / 2 );
        }

      , hide: function ( selector ) {
          var $this = $( selector );
          $this.find( '.loading, .backdrop' ).remove();
      }
    };

}( window.jQuery );

