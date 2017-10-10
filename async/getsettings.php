<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetSettings_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			$tablename = $this->_getString('tablename', $_params, false);
            
            $settingsobj = $mySql->getRecords($tablename, array('domain_id' => $_domainId),'`id`');
            
            $customsettings = $mySql->getRecords('custom_settings', array('domain_id' => $_domainId),'`id`');

            $this->data['settingsobj'] = $settingsobj;
            $this->data['customsettings'] = $customsettings;
            
        }
    }
        

?>