(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        explorer: {
            elt: $('#explorer'),
            nav: $('#explorer-tree-nav'),
            init: function() {
                
                $m.events.bind( 'click' , '#explorer' , function ( event ) {
                    var $target = $( event.target );
                    
                    switch ( true ) {
                        case $target.hasClass( 'delete-folder' ) || $target.closest( '.delete-folder' ).length > 0 :
                            var path = $target.closest('.album, .image').attr('data-path');
                            $m.explorer.events.deleteFolder( path );
                            break;
                            
                        case $target.hasClass( 'file-download' ) || $target.closest( '.file-download' ).length > 0 :
                            var path = $target.closest('.album, .image').attr('data-path');
                            window.location.href = $m.api.utils.url('file','download',{path: path});
                            break;
                            
                        case $target.hasClass( 'image-cover' ) || $target.closest( '.image-cover' ).length > 0 :
                            var path = $target.closest('.image').attr('data-path');
                            $m.view.image.cover( path );
                            break;
                        
                        case $target.closest( '.image-rotate' ).length > 0 : $target = $target.closest( '.image-rotate' );
                        case $target.hasClass( 'image-rotate' ):
                            var angle = $target.attr('data-value');
                            var path = $target.closest('.image').attr('data-path');
                            
                            console.log( 'rotate' , path , angle );
                            
                            $m.api.put({ c: 'image', a: 'rotate', path: path, angle: angle
                            },function(json){
                                if ( json.status == 'success' ) {
                                    var $img = $('.image[data-path="'+path+'"] img');
                                    $img.attr('src', $img.attr('src') + '&t='+(new Date()).getTime() )
                                }
                            });
                            break;
                        
                        case $target.closest( '.album' ).length > 0 : $target = $target.closest( '.album' );
                        case $target.hasClass( 'album' ) :
                            var path = $target.attr('data-path');
                            var nav = $( '#explorer-tree-nav a[data-path="'+path+'"]' );
                            if ( nav.length ) {// Already loaded folder
                                nav.trigger( 'click' );
                            } else {
                                $m.explorer.path( path , true );
                            }
                            break;
                    }
                });
                
                $m.events.bind( 'dragover' , 'window' , function ( event ) {
                    event.originalEvent.preventDefault();
                });
                
                $m.events.bind( 'drop' , 'window' , function ( event ) {
                    var $target = $( event.target );
                    
                    event.originalEvent.stopPropagation();
                    event.originalEvent.preventDefault();
                    
                    if ( $target.closest('.album').length ) {
                        $target = $target.closest('.album');
                        $target.append('<div style="float: right; width: 100%; margin-top: -0.5em;" class="progress-bar upload-progress"><div class="progress progress-striped" style="height: 0.5em;margin: 0em;border-radius: 0px;"><div class="bar" style="width:0%;"></div></div></div>');
                        $m.utils.upload( event.originalEvent , $target.attr('data-path') );
                    }
                    
                    event.stopPropagation();
                    event.preventDefault();
                });
                
                $m.events.bind( 'click' , '#explorer-tree-nav' , function ( event ) {
                    var $target = $( event.target );
                    var path = $target.attr('data-path');
                    $m.explorer.goto( path );
                });
                
                // Menu actions :
                $m.events.bind( 'click' , '#menu-dropdown' , function ( event ) {
                    var $target = $( event.target );
                    if ( !$target.hasClass('btn') ) $target = $target.parent();
                });
                
                // Search form binding :
                $m.events.bind( 'submit' , '#form-filter' , function ( event ) {
                    
                    $m.api.get({
                        c:'file',
                        a:'search',
                        path: $m.state.path,
                        search: $( event.target ).val()
                    },
                    function( json ){
                        
                        if ( $( 'search-panel' ).length == 0 ) {
                        
                            for ( var type in json ) {
                                if ( $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                                   // $m.view[type].load( p , json[type] );
                                   console.log( 'Search : object type = ' + type );
                                }
                            }
                        }
                    });

                    
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });
            
            },
            goto: function ( path ) {
                var $folder = $('.folder[data-path="'+path+'"]');
                
                if ( $folder.length ) {
                    
                    $('a[data-path="'+path+'"]',$m.explorer.nav).parent().addClass('active').siblings('.active').removeClass( 'active' );
                    
                    $('a[data-path="'+path+'"]',$m.explorer.elt).addClass('loading').siblings('.loading').removeClass('loading');
                    
                    setTimeout(function(){
                        if ( true ) {
                            $folder.addClass('active').addClass('fadein').siblings('.active').removeClass( 'active' );

                            setTimeout(function(){
                                $('a[data-path="'+path+'"]',$m.explorer.elt).removeClass('loading');
                                $folder.removeClass('fadein')
                            },10);
                            /*$folder.siblings('.active').fadeOut(1000,function(){

                            })*/
                            //$folder.addClass('active').siblings('.active').removeClass( 'active' );
                            //$folder.siblings('.active').fadeOut(400,function(){
    //                            $folder.fadeIn(400,function(){
    //                                $folder.addClass('active').siblings('.active').removeClass( 'active' );
    //                            });
                            //})
                        } else if ( false ) {
                            $folder.addClass('active').siblings('.active').removeClass( 'active' );
                            $('a[data-path="'+path+'"]',$m.explorer.elt).removeClass('loading');
                        } else if ( false ) {
                            var direction = $folder.prevAll('.active').length ? true : false ;

                            var outgoing = ( direction ? 'in' : 'out' ) + 'going';
                            var ingoing = ( !direction ? 'in' : 'out' ) + 'going';

                            $folder.siblings('.active').addClass( outgoing );

                            setTimeout(function(){
                                $folder.addClass('active').addClass( ingoing )

                                setTimeout(function(){
                                    $folder.removeClass(ingoing);
                                    setTimeout(function(){

                                        $('a[data-path="'+path+'"]',$m.explorer.elt).removeClass('loading');

                                        $folder.siblings('.'+outgoing).removeClass('active').removeClass(outgoing);
                                    },1000);
                                }, 150);

                            }, 250 );
                        }
                    },150);
                }
                
                // Save the new path to the UI 
                $m.storage.set( 'state.path' , path );
            },
            path: function ( path ) {
                if ( path === undefined ) return $m.state.path;
            
                var folders = path.split( '/' ); var c = folders.length;
                
                $m.state.loading = true;
                
                var $f = undefined;
                $.each(folders,function(i,o){
                    // Current folder absolute path :
                    var p = folders.slice(0,i+1).join('/');
                    var $folder = $('.folder[data-path="'+p+'"]');
                    
                    if ( $folder.length ) $f = $folder;
                    else if ( $f !== undefined && $f.length ) {
                        $m.explorer.nav.find( 'a[data-path="'+$f.attr('data-path')+'"]' ).parent().nextAll().remove();
                        $f.nextAll().remove();
                        return false;
                    } else if ( p != '' ) {
                        $m.explorer.nav.empty();
                        $('.folder').remove();
                    }
                });
                
                //$m.explorer.elt.css('width', ( 100 / $m.config.columns * (c-1) ) + '%' )
                
                //$('#explorer-tree-nav').empty();
                
                var i = folders.length-1;
                var f = [
                    function(){
                        if ( i >= 0 ) {
                            // Current folder absolute path :
                            var p = folders.slice(0,i+1).join('/');
                            
                            
                            
                            if ( $('.folder[data-path="'+p+'"]').length == 0 ) {
                                // Update the navigation bar :
                                $m.explorer.prependNav( i , folders , p , c-i <= 2 );
                            
                                // Add folder to the explorer :
                                $m.explorer.addFolder( i , folders , p , 2 );
                                $m.api.get({c:'file',a:'list',path: p},function(json){
                                    $m.log(json);
                                    
                                    for ( var type in json ) {
                                        if ( $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                                            $m.view[type].load( p , json[type] );
                                        }
                                    }
                                    
                                    // Move to the last folder :
                                    if ( i == folders.length-1 ) {
                                        $m.explorer.goto( $m.explorer.elt.find('.folder:last-child').attr('data-path') );
                                    }
                                    
                                    i--; setTimeout( f[0] , 250 );
                                });
                            } else {
                                i--; f[0]();
                            }
                            
                        } else f[1]();
                    },
                    function(){
                        //$m.explorer.elt.find('.folder:last-child').addClass('active');
                        //$m.explorer.goto( $m.explorer.elt.find('.folder:last-child').attr('data-path') );
                        $m.state.loading = false;
                        
                        $m.explorer.events.scroll();
                    }
                ]; f[0]();
            },
            prependNav: function ( level , folders , path , visible ) {
                var name = folders[level];
                //$m.explorer.nav.prepend('<li'+( visible ? ' class="visible"' : '' )+'><span class="divider">/</span><a data-path="'+path+'" href="javascript:void(0);">'+( path == '' ? '<i class="icon-home" style="pointer-events: none;"></i>' : name )+'</a></li>');
                $link = $( '<li'+( visible ? ' class="visible"' : '' )+' data-level="'+level+'">'+
                            '<span class="divider">/</span>'+
                            '<a data-path="'+path+'" href="javascript:void(0);">'+( path == '' ? '<i class="icon-home" style="pointer-events: none;"></i>' : name )+'</a>'+
                        '</li>');
                if ( $m.explorer.nav.find('li[data-level="'+(level-1)+'"]').length ) {
                    $m.explorer.nav.find('li[data-level="'+(level-1)+'"]').after( $link )
                } else {
                    $m.explorer.nav.prepend( $link );
                }
            },
            addFolder: function ( level , folders , path , c ) {
                var name = folders[level];
                
                if ( $('.folder[data-path="'+path+'"]').length == 0 ) {
                    
                    var $column = $('<div class="column folder" data-level="'+level+'" id="'+path.replace(/[^0-9a-z]/gi,'-')+'" data-path="'+path+'" style="width: '+(100/(c-1))+'%;"></div>');
                    var $content = $('<div class="content"></div>');
                    
                    //$content.append( '<div class="name">' + name + '</div>' );
                    
                    $column.append('<div class="scroll-detector" style="" onClick="$m.explorer.events.scroll();">Load more...</div>');
                    
                    $column.prepend( $content );
                    if ( $('.folder[data-level="'+(level-1)+'"]').length ) {
                        $('.folder[data-level="'+(level-1)+'"]').after( $column )
                    } else {
                        $m.explorer.elt.prepend( $column );
                    }
                    
                    $m.events.bind( 'scroll' , '#'+path.replace(/[^0-9a-z]/gi,'-') , $m.explorer.events.scroll );
                    
                }
            },
            
            
            
            events: {
                scroll: function ( event ) {
                    
                    if ( $m.state.loading != true ) {
                        
                        console.log( 213 , $m.state.loading );
                
                        $('.folder.active .scroll-detector',$m.explorer.elt).each(function(i,o){
                            o = $(o);
                            var position = o.position();

                            if ( position.top < window.screen.height * 2 ) {
                                
                                $m.state.loading = true;
                                
                                var $folder = $('.folder.active',$m.explorer.elt);
                                var p = $folder.attr('data-path');
                                var request = {
                                    c:'file',a:'search',
                                    path: p, offset: $folder.find('.entry, .image, .album, .music-song, .pdf').length,
                                };

                                if ( $('#search').val() ) request['search'] = $('#search').val();

                                $m.api.get(request,function(json){
                                    
                                    console.log( 234 , json );
                                    
                                    // Filter inputs already loaded :
                                    for ( var type in json ) {
                                        for ( var i in json[type] ) {
                                            if ( $('*[data-path$="'+json[type][i]+'"]',$folder).length ) {
                                                delete json[type][i];
                                            }
                                        }
                                    }
                                    
                                    var processed = false;
                                    for ( var type in json ) {
                                        if ( $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                                            processed = true;
                                            $m.view[type].load( p , json[type] );
                                        }
                                    }

                                    if ( !processed ) {
                                        $('.folder.active .scroll-detector',$m.explorer.elt).remove();
                                    }
                                    
                                    setTimeout(function(){ $m.state.loading = false; }, 1000 );

                                });
                            }
                        });
                    }
                },
                
                createFolder: function ( event ) {
                    var name = prompt( 'Folder name :' );
                    
                    if ( name != '' && !name.match(/^\./) && confirm('Are you sure you want to create this folder ?') ) {
                        $m.api.post({ c:'file', a:'folder', path: $m.state.path, name:name},function(json){
                            
                            $m.view.folder.load( $m.state.path , [ name ] );
                            
                        });
                    }
                },
                deleteFolder: function ( path ) {
            
                    if ( confirm( 'Are you sure you want to remove the folder "'+path+'" ? This can not be undone.' ) ) {
                        $m.api.delete_({ c: 'file', a: 'delete', path: path },function(json){
                            if ( json.status == 'success' ) {
                                if ( $('.album[data-path="'+path+'"]').length ) {
                                    $('.album[data-path="'+path+'"]').remove();

                                    $('.folder[data-path="'+path+'"]').nextAll().andSelf().remove();

                                    $('#explorer-tree-nav a[data-path="'+path+'"]').closest('li').nextAll().andSelf().remove();
                                } else if ( $('*[data-path="'+path+'"]').length ) {
                                    $('*[data-path="'+path+'"]').remove();
                                }
                                
                            }
                        });
                    }
                }
            }
            
        },
    });
    
    $m.explorer.init();
    
})(jQuery);