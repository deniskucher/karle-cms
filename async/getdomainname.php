<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetDomainName_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			
            $domainname = $mySql->getRecord('domains', array('id'=>$_domainId));
            
            $this->data['domainname'] = $domainname['name'];
            
        }
    }
        

?>