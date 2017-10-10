<?php
 
     
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_DeleteHorseVideoServer_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            // $dirforDel = '../../../../uploads/temp/';
            $dirforDel = $this->_getString('dir', $_params, true);

            $this->dirDel($dirforDel);
            
        }

        public function dirDel ($dir){ 
            $d=opendir($dir); 
            while(($entry=readdir($d))!==false)
            {
                if ($entry != "." && $entry != "..")
                {
                    if (is_dir($dir."/".$entry))
                    { 
                        dirDel($dir."/".$entry); 
                    }
                    else
                    { 
                        unlink ($dir."/".$entry); 
                    }
                }
            }
            closedir($d); 
            rmdir ($dir); 
        }
    }

?>