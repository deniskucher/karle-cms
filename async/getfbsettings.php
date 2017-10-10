<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    
    class Basic_GetFBSettings_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            
            $facebookEnabled = $mySql->getRecord('users', array('domain_id'=>$_domainId));
            $facebookEnabled = $facebookEnabled['facebook'];
            $sendToFbDefault = $mySql->select('value', 'settings', array('name' => 'send_to_fb_default', 'domain_id'=>$_domainId))->fetchCellValue('value');
            
            $data['facebook'] = $facebookEnabled;
            $data['sendToFbDefault'] = $sendToFbDefault;
            
            $this->data['fb'] = $data;
            
        }
    }
        

?>