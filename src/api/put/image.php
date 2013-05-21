<?php

require_once 'file.php';
require_once 'get/image.php';

class Api_Put_Image extends Api_Put_File {

    public function rotateAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        if ( array_key_exists('path',$p) ) {
            $path = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
            
            $folder = preg_replace( '/\/[^\/]+$/' , '' , str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] ));
            $data = preg_replace( '/\/[^\/]+$/' , '' , str_replace( '//' , '/' , $config['data'] . '/' . $p['path'] ));
            $file = preg_replace('/.*\//','',$path);
            
            // Creation of the thumb image :
            //$result = Api_Utils::exec( 'cd "' . $folder . '"; convert -rotate ' . floatval( $p['angle'] ) . ' -compress LossLess '.$file.' '.$file );
            $result = Api_Utils::exec( 'cd "' . $folder . '"; convert -rotate ' . floatval( $p['angle'] ) . ' "'.$file.'" "'.$file.'"' );
		    
            chdir( $data );
            
            error_log( getcwd() );
            
		    // Remove all thumbnails :
		    $result = Api_Utils::exec( 'rm *"-' . $file . '";' );
        }
        
        echo Api_Utils::outputJson(array(
            'status' => 'success'
        ));
        die();
        
    }
    
    public function coverAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        if ( array_key_exists('path',$p) ) {
            $p['album'] = preg_replace( '/\/[^\/]+$/' , '' , $p['path'] );
            
            // Level navigation :
            if ( array_key_exists( 'level' , $p ) ) {
                for ( $i = 0 ; $i < intval( $p['level'] ) ; $i++ ) {
                    $p['album'] = preg_replace( '/\/[^\/]+$/' , '' , $p['album'] );
                }
            }
        
            $path = $config['path'] . $p['path'];
            
            Api_Utils::log( 'path = ' . $path , LOG_DEBUG , __METHOD__ );
            
            if ( file_exists( $path ) ) {
                Api_Utils::log( 'File exists' , LOG_DEBUG , __METHOD__ );
            
                foreach ( $config['image'] as $mode => $name ) {
                    if ( $config[$mode] ) {
                        $p['mode'] = $mode;
                        Api_Utils::log( 'mode = ' . $mode , LOG_DEBUG , __METHOD__ );
                        if ( array_key_exists('mode',$p) && array_key_exists($p['mode'],$config['image']) ) {
                        
                            $p['thumb'] = preg_replace( '/([^\/]+)$/' , $config['image'][$p['mode']].'-$1' , $p['path'] );
                            $path = $config['data'] . $p['thumb'];
                            
                            if ( !file_exists( $config['data'] . $p['thumb'] ) ) {
                                Api_Get_Image::_createThumb($p);
                            }
                        }
                        
                        $result = Api_Utils::exec( 'cp "'.$config['data'] . $p['thumb'].'" "'.$config['data'] . $p['album'] .'/' . $config['image'][$p['mode']] . '-album-cover.jpg"' );
                    }
                }
            }
        }
        
        echo Api_Utils::outputJson(array(
            'status' => 'success'
        ));
        die();
    }
}