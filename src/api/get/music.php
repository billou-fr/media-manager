<?php

require_once 'file.php';

class Api_Get_Music extends Api_Get_File {

    public static function genres () {
        
	    $genres = array();
	    
	    exec( 'mp3info -G' , $out );
	    for ( $i = 2 ; $i < count($out) ; $i++ ) {
	        preg_match_all('/(\d+ [^\d]+)/',$out[$i],$match);
	        foreach ( $match[0] as $genre ) {
	            $id = intval(preg_replace('/ [^\d]+$/','',$genre));
	            $name = preg_replace('/^\d+ /','',$genre);
	            $genres[$id] = $name;
	        }
	    }
 	    
	    return $genres;
    }

    public static function mp3info ( $folder , $file , $infos = array() ) {
    
        $cmd = "mp3info -p \"%t\n%m:%02s\n%a\n%l\n%n\n%y\n%G\n\" \"".$folder.'/'.$file."\"";
		exec( $cmd , $result );
        
        error_log( var_export( $result , TRUE) );
        
        $keys = array('title','duration','artist','album','track','year','genre' );
        
        $infos = array_merge( $infos , array(
            'path' => $file
        ));
        
        foreach ( $keys as $i => $key ) {
            $infos[$key] = $result[$i] != '' ? $result[$i] : ( array_key_exists($key,$infos) ? $infos[$key] : '' );
        }
                                      
        // Translate the MP3 genre information :
        $genres = self::genres();
        if ( isset( $genres[ intval( $infos['genre'] ) ] ) )
            $infos['genre'] = $genres[ intval( $infos['genre'] ) ];
        else
            $infos['genre'] = '';

        $infos['title'] = preg_replace( '/\.[^\.]*$/' , '' , $infos['title'] );

        return $infos;
    }

    public function listAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        $r = Api_Get_File::search( $p , array(
            'organize' => true
        ));
        
        // Read data for music files only :
        $music = array();
        if ( count( $r['music'] ) > 0 ) {
            foreach ( $r['music'] as $i => $path ) {
                $music[] = self::mp3info( $config['path'] . '/' . $p['path'] , $path , array(
                    'track' => $i + 1,
                    'title' => preg_replace( '/.*\/(.+)\.[^\.]+$/' , '$1' , $path )
                ));
            }
        }
        
        echo Api_Utils::outputJson( $music );
        die();
    }
    
    public function genresAction () {
        echo Api_Utils::outputJson( self::genres() );
        die();
    }
}