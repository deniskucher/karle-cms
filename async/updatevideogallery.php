<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_UpdateVideoGallery_AsyncAction extends Basic_Abstract_AsyncAction
    {
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $data = $this->_getArray('data', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);

            if ($data) {
                foreach ($data as $datakey => $datavalue) {
                $mySql->update($tablename, $datavalue, array('id' => $datakey));
                }
                
            }
           
        }
    }
        

?>