<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetPagesData_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $query = $this->_getString('query', $_params, false);
            $tablename = $this->_getString('tablename', $_params, false);
            $thname_arr = $this->_getArray('search', $_params, false);
            
            if (!(($query == '')or($query == '*'))) {
                foreach ($thname_arr as $key => $thname) {
                
                    if (!$criteria) {
                    $criteria = $tablename.'.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                    }
                    else{
                           $criteria .= ' OR '.$tablename.'.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                    }
                }
            }
            
            if (!$criteria) {
                
                $tabledata = $mySql->getRecords($tablename, array('domain_id' => $_domainId),'`id`');
            }
            else{
                
                $criteria = '('.$criteria.')'.' AND `domain_id` LIKE '.$_domainId;
                $tabledata = $mySql->getRecords($tablename, $criteria, '`id`');
                
            }
            
            if (!$tabledata) {
                
                throw new AsyncActionException('Data not found.');

            }
           
            $this->data['criteria'] = $criteria;
            $this->data['tabledata'] = $tabledata;
            
        }
    }
        

?>