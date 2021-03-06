<?php

/* ===================================================
 * Media Manager v0.1
 * https://github.com/billou-fr/Mesh/
 * ===================================================
 * Copyright 2013 Gilles Rasigade
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

// Parse configuration :
include_once '../app/config/initialize.php';

session_start();

$namespace = 'api';

// RESTfull API for communications :
// Default responses format is JSON.

// REST API initialization :
$method = $_SERVER['REQUEST_METHOD'];

if ( isset($_REQUEST['m']) ) $method = $_REQUEST['m'];

switch ( $method ) {
    case 'GET':

        if ( isset($_GET['state']) ) {
            echo json_encode(array(
                'typesOrder' => array( 'folder' , 'music' , 'card' , 'video' , 'pdf' ),
                'server' => 'local',
                'servers' => array(
                    'local' => array(
                        'name' => 'local',
                        'url' => $config['servers']['local'],
                        'login' => $_SESSION['login'],
                        'timestamp' => $_SESSION['timestamp'],
                        'hash' => hash( 'sha256' , $_SESSION['timestamp'] . '|' . $_SESSION['login'] . '|' . $config['users'][$_SESSION['login']] ),
                        'share' => hash( 'sha256' , 0 . '|' . $_SESSION['login'] . '|' . $config['users'][$_SESSION['login']] ),
                    )
                )
            ));
            die();
            break;
        }

    case 'POST':
    case 'PUT':
    case 'DELETE':
        // Moving to the API folder :
        chdir('../src/api/');
        
        // Load utilities class object : static access.
        require_once 'utils.php';
        
        // Authentication :
        $auth = array();
        if ( array_key_exists( 'auth' , $_REQUEST ) ) {
            $auth = json_decode( base64_decode( $_REQUEST['auth'] ) , TRUE );
        } else {
            $headers = getallheaders();
            if ( array_key_exists( 'AuthenticationHash' , $headers ) && array_key_exists( 'Timestamp' , $headers ) ) {
                $auth = array(
                    'AuthenticationHash' => $headers['AuthenticationHash'],
                    'Timestamp' => $headers['Timestamp'],
                    'Timestamp2' => $headers['Timestamp2'],
                );
            }
        }
        
        error_log( var_export( $auth , TRUE ) );
        //var_dump( $auth );
        
        if ( array_key_exists( 'AuthenticationHash' , $auth ) && array_key_exists( 'Timestamp' , $auth ) ) {
            $hash = $auth['AuthenticationHash'];
            $timestamp = $auth['Timestamp'];
            $isAuthenticated = FALSE;
            $isAnonymous = FALSE;
            
            $timestamp2 = NULL;
            
            // Check request timestamp delay :
            if ( mktime() - round(floatval($timestamp)/1000) < 60 ) {
                
                if ( array_key_exists('Timestamp2',$auth) && $auth['Timestamp2'] !== NULL && is_numeric($auth['Timestamp2']) ) { // Anonymous connection - Not yet managed
                    $timestamp2 = $auth['Timestamp2'];

                    // Check authentication timestamp delay :
                    if ( mktime() - round(floatval($timestamp2)/1000) >= 24*3600 ) {
                        $timestamp2 = NULL;
                        
                        session_destroy();
                        header('HTTP/1.0 401 Unauthorized');
                        die('User credentials expired.');
                    }

                } else if ( array_key_exists('timestamp',$_SESSION) ) {
                    $timestamp2 = $_SESSION['timestamp'];
                } else if ( isset($auth['Timestamp2']) && is_string($auth['Timestamp2']) ) {
                    // Anonymous access to folders and files:
                    $timestamp2 = 0;
                    
                    $p = Api_Utils::readToken();
                    if ( isset($p['path']) && !preg_match('@'.$auth['Timestamp2'].'@',$p['path'])) {
                        session_destroy();
                        header('HTTP/1.0 403 Forbidden');
                        die('Wrong credentials.');
                    }
                }

                if ( $timestamp2 !== NULL ) {
                    error_log( 'timestamp = ' . $timestamp );
                    error_log( 'timestamp2 = ' . $timestamp2 );
                    error_log( 'hash = ' . $hash );
                    foreach ( $config['users'] as $login => $password ) {
                        if ( $hash == hash( 'sha256' , $timestamp . hash( 'sha256' , $timestamp2 . '|' . $login . '|' . $password ) ) ) {
                            $isAuthenticated = TRUE;
                            if ( $timestamp2 == 0 ) $login = 'anonymous';
                            if ( isset( $config[$login] ) ) {
                                $config['user'] = $config[$login];
                                $config['user']['login'] = $login;
                            }
                            break;
                        }
                    }
                }
            }
            
            //var_dump( $timestamp2 , json_decode( $config['user']['methods'] ) );
            
            if ( !$isAuthenticated ) {
                session_destroy();
                header('HTTP/1.0 403 Forbidden');
                die('Wrong credentials.');
            }
            
        } else {
            header('HTTP/1.0 403 Forbidden');
            die('Missing authentication keys.');
        }
        
        $m = strtolower($method);
        
        //var_dump( $m , json_decode($config['user']['methods']) );
        
        // Filter request based on the user permissions :
        if ( !in_array( $m , json_decode($config['user']['methods'])) ) {
            header('HTTP/1.0 403 Forbidden');
            die('Not authorized method.');
        }
        
        if ( is_dir( $m ) ) {
            
            // Reading the controller name :
            $c = strtolower( $_REQUEST['c'] );
            
            if ( empty($c) ) die('Controller name can not be empty');
            
            $lib = './' . $m . '/' . strtolower($c) . '.php';
            if ( file_exists($lib) ) {
                
            
                // Require the correct controller :
                require_once $lib;
                
                // Build of the class name :
                $className = ucfirst($namespace) . '_' . ucfirst($method) . '_' . ucfirst( $c );
                
                // Instantiation of the controller
                $controller = new $className();
                
                // Read the action to apply :
                $a = $_REQUEST['a'] . 'Action';
                
                if ( method_exists($controller,$a) ) {
                    // Call of the correct method to the requested controller :
                    $controller->$a();
                } else {
                    header('HTTP/1.0 400 Bad Request');
                    die('Action ' . $a . ' does not exist for controller ' . $c . '.');
                }
                
            } else {
                header('HTTP/1.0 400 Bad Request');
                die('Controller ' . $c . ' is not currently implemented for the method GET.');
            }
        
            include_once $lib;
        } else {
            header('HTTP/1.0 405 Method Not Allowed');
            die('Method ' . $method . ' is not currently implemented.');
        }
        break;
    default:
        header('HTTP/1.0 400 Bad Request');
        die('Unsupported API access method.');
        break;
}

die();
?>
