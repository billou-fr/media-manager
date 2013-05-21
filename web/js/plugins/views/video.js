(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            video: {
            
                src: function ( path , mode ) {
                    return $m.api.utils.url( mode == 'thumb' ? 'video' : 'file' , mode == 'thumb' ? 'access' : 'access' , {
                        path: path, mode: mode !== undefined ? mode : 'full'
                    });
                }, 
            
            
                columns: {
                    width: 320, number: 3,
                },
                initialize: function( path ) {
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.videos').remove();
                            
                        var $folders = $('<div class="videos type entries"></div>');
                        
                        $m.view.video.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.video.columns.width ));
                    
                        for ( var i = 0 ; i < $m.view.video.columns.number ; i++ ) {
                            $folders.append('<div class="column" style="width: '+(100/$m.view.video.columns.number)+'%;"><div class="column-content"></div></div>');
                        }
                        
                        $folder.append( $folders );
                    }
                
                },
                
                load: function ( path , json ) {    
                
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.videos' ).length === 0 ) $m.view.video.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                        
                                var p = path+'/'+json[i];
                                
//                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
                                if ( json[i] ) {
                                
                                    // Photo positioning :
                                    var h = -1; var column = Math.ceil(Math.random()*$m.view.video.columns.number);
                                    var $f = $folder.parent();
                                    for ( var c = 1 ; c <= $m.view.video.columns.number ; c++ ) {
                                        var $c = $folder.find('.videos > .column:nth-child('+c+') > .column-content');


                                        if ( !$f.hasClass('active') )
                                            $f.css({'position':'absolute','visibility':'hidden', 'display':'block'});

                                        var height = $c.height();

                                        if ( !$f.hasClass('active') )
                                            $f.css({'position':'','visibility':'', 'display':''});


                                        if ( h == -1 || height < h ) {
                                            h = height; column = c;
                                        }
                                    }

                                    var title = json[i] ;
                                    var details = [];
                                    if ( title ) {
                                        if ( title.match(/^[\d-,]+ /) ) {
                                            details.push( title.replace(/^([\d-,]+) .*/,'$1') );
                                        }


                                        details.push( title.replace(/.*\.([^\.]+)$/,'$1') );

                                        title = title.replace(/^[\d-,]+ /,'').replace(/\.[^\.]+$/,'');
                                    }

                                    //title="'+json['folder'][i]+'"
                                    var $div = $('<a target="_blank" data-path="'+p+'" href="'+$m.view.video.src(p)+'" class="video entry">'+
                                            '<img class="video-img" src="'+$m.view.video.src(p,'thumb')+'" style="height: auto; padding: 0px; margin: 0px; border: 0px;"/>'+
                                            '<i class="video-over icon-play-sign"></i>'+
                                            '<span class="actions"><i class="icon-facetime-video"></i></span>'+
                                            '<span title="'+json[i]+'" class="video-title">'+title+'</span>'+
                                            '<span class="video-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</a>');

                                    $folder.find('.videos > .column:nth-child('+column+') > .column-content').append($div);
                                }
                                
                                i++; f[0]();
                            } else f[1]();
                        },  
                        function() {
                            
                            $('.video .video-title.details:not(.updated)').first().each(function(i,o){
                                var $o = $(o).addClass('updated');
                                var p = $o.closest('.album').attr('data-path');
                            });
                        }
                    ]; f[0]();
                }
            },
        }
    } );
})(jQuery);
