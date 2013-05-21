<?php

require_once 'file.php';

class Api_Post_Card extends Api_Post_File {

    public function createAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            
            $path = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
            chdir( $path );
            
            // Building the file name :
            $index = Api_Utils::exec( 'ls *.card.json | sort -g | tail -n 1' );
            if ( preg_match( '/.*.card.json/' , $index[0]  ) ) {
                $index = intval( preg_replace( '/^(\d+)-.*/' , '$1' , $index[0] ) );
                
            } else $index = -1;
            
            $name = ($index+1) ;
            if ( isset($p['title']) && $p['title'] != '' ) {
                $title = substr( preg_replace( '/ /' , '-' , strtolower( trim( $p['title'] ) ) ) , 0 , 50 );
                $name .= '-' . $title ;
            }
            $name .= '.card.json';
            
            if ( !file_exists($name) ) {
                $card = $p;
                
                unset( $card['path'] );
                
                $card['createdAt'] = $card['updatedAt'] = gmdate('Y-m-d');
                
                $status = file_put_contents( $name , Api_Utils::outputJson( $card , FALSE ) );
            }
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status
        ));
        die();
    }

}