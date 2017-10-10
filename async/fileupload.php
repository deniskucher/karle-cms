<?php

    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * File upload action
     *
     * @author     Alexander Babayev
     * @copyright Copyright &copy; 2008-2015 Alexander Babayev
     * @since      3.0
     */
    class Basic_FileUpload_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = NULL, array $_params = array())
        {
            //error_reporting(E_ERROR);
            // throw new AsyncActionException('Error');
            
            // require_once(PLUGINS_DIR_PATH.'jquery.fine-uploader-5.14.2/server/handler.php');
            
            require_once (LIBS_DIR_PATH.'fine-uploader/handler.php');
            // throw new AsyncActionException('load');

            $uploader = new UploadHandler();

            // Specify the list of valid extensions, ex. array("jpeg", "xml", "bmp")
            $uploader->allowedExtensions = array(); // all files types allowed by default

            // Specify max file size in bytes.
            $uploader->sizeLimit = null;

            // Specify the input name set in the javascript.
            $uploader->inputName = "qqfile"; // matches Fine Uploader's default inputName value by default

            // If you want to use the chunking/resume feature, specify the folder to temporarily save parts.
            $uploader->chunksFolder = "chunks";

            $method = $_SERVER["REQUEST_METHOD"];
            
            header("Content-Type: text/plain");

            // Assumes you have a chunking.success.endpoint set to point here with a query parameter of "done".
            // For example: /myserver/handlers/endpoint.php?done
            if (isset($_GET["done"])) {
                $result = $uploader->combineChunks("files");
            }
            // Handles upload requests
            else {
                // Call handleUpload() with the name of the folder, relative to PHP's getcwd()
                $result = $uploader->handleUpload('tmp');
                
                if (array_key_exists('error', $result))
                    throw new AsyncActionException($result['error']);

                // To return a name used for uploaded file you can use the following line.
                $this->data['filename'] = $uploader->getUploadName();
                // $dirname = $uploader->handleUpload();
                $this->data['dirname'] = $result['uuid'];

            }

            // $allowedExtensions = array();
            // //$allowedExtensions = array('pdf', 'txt');
            // $sizeLimit = 5 * 1024 * 1024;
            // //$sizeLimit = 1 * 1024 * 1024;
            // $uploader = new qqFileUploader($allowedExtensions, $sizeLimit);
            // $result = $uploader->handleUpload(TMP_DIR_PATH, true);
            
            // $this->data['filename'] = $uploader->getName();
        }
        
    }

?>