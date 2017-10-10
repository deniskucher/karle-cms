<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetNews_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $query = $this->_getString('query', $_params, false);
            $create = $this->_getString('create', $_params, false);
            // $role = $this->_getString('role', $_params, false);
            $columnforsearchmass = array();
            $thname_json = $this->_getString('columnforsearchmass', $_params, false);
            $thname_arr = json_decode($thname_json, TRUE);
            
           	$usersid = $mySql->getRecord('users', array('domain_id' => $_domainId));
            
            if (!(($query == '')or($query == '*'))) {
                foreach ($thname_arr as $key => $thname) {
                    
                    if (!$criteria) {
                        $criteria = '`'.$thname.'` LIKE \'%'.mysql_real_escape_string($query).'%\'';
                    }
                    else{
                        $criteria .= ' OR `'.$thname.'` LIKE \'%'.mysql_real_escape_string($query).'%\'';
                    }
                    
                }
            }
            
            // if (!(($role == 'all')or($role == null))) {
            //     if ($criteria) {
            //         $criteria = '('.$criteria.')'.'AND `user_role_id` LIKE \'%'.mysql_real_escape_string($idRole).'%\'';
            //     }
            //     else{
            //         $criteria = '`user_role_id` LIKE \'%'.mysql_real_escape_string($idRole).'%\'';
            //     }
                
            // }
            if (!$criteria) {
                $users = $mySql->getRecords('news', array('domain_id' => $_domainId),'`id`');

            }
            else{
                $criteria = '('.$criteria.')'.' AND `domain_id` LIKE '.$_domainId;
                $users = $mySql->getRecords('news', $criteria, '`id`');
            }
            
            if (!$users) {
            	$this->data['criteria'] = $criteria;
                throw new AsyncActionException('Data not found.');

            }
            
            foreach ($users as $key2 => $value2) {
                $date = date_create($users[$key2]['date'])->Format('m/d/Y');
                $users[$key2]['formatsdate'] = $date;
            }
            $this->data['users'] = $users;
            $this->data['usersid'] = $usersid['id'];
            
        }
    }
        

?>