<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetUsers_AsyncAction extends Basic_Abstract_AsyncAction
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
            $role = $this->_getString('role', $_params, false);
            $columnforsearchmass = array();
            $thname_json = $this->_getString('columnforsearchmass', $_params, false);
            $thname_arr = json_decode($thname_json, TRUE);
            $sexes = array('mare' => '0', 'gelding'=> '1', 'stallion'=> '2');
            
           	// if ($role) {
            //     $idRole = $mySql->select('id', 'user_roles', array('name' => $role))->fetchCellValue('id');
            // }
            
            if (!(($query == '')or($query == '*'))) {
                foreach ($thname_arr as $key => $thname) {
                    if ($thname == 'sex') {
                        $querysex = mb_strtolower($query);
                        foreach ($sexes as $key1 => $value) {
                            if (strpos($key1, $querysex) !== false) // именно через жесткое сравнение
                            $querysex = $key1; 
                        }
                        $querysex = $sexes[$querysex];
                        if (!$criteria) {
                            $criteria = 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($querysex).'%\'';
                        }
                        else{
                            $criteria .= ' OR horses.'.$thname.' LIKE \'%'.$querysex.'%\'';
                        }
                    }
                    else if ($thname == 'age') {
                        $queryage = intval($query);
                        if ($queryage !== 0) {
                            $queryage = date("Y") - $query;
                            if (!$criteria) {
                                $criteria = 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($queryage).'%\'';
                            }
                            else{
                                $criteria .= ' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($queryage).'%\'';
                            }
                        }
                    }
                    else if ($thname == 'updated') {
                        $currenttime = time();
                        $queryupdated = intval($query);
                        
                        if ($queryupdated !== 0) {
                            $daysago = $currenttime - ($query*24*3600);
                            $hoursago = $currenttime - (($query+0.5)*3600);
                            $minutesago = $currenttime - ($query*60);
                            $daysupdated = date('Y-m-d', $daysago);
                            $hoursupdated = date('Y-m-d H:', $hoursago);
                            $minutesupdated = date('Y-m-d H:i:', $minutesago);
                            if (!$criteria) {
                                $criteria .= 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($daysupdated).'%\' OR `'.$thname.'` LIKE \'%'.mysql_real_escape_string($hoursupdated).'%\' OR `'.$thname.'` LIKE \'%'.mysql_real_escape_string($minutesupdated).'%\'';
                            }
                            else{
                                $criteria .= ' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($daysupdated).'%\' OR `'.$thname.'` LIKE \'%'.mysql_real_escape_string($hoursupdated).'%\' OR `'.$thname.'` LIKE \'%'.mysql_real_escape_string($minutesupdated).'%\'';
                            }
                        }
                        
                    }
                    // elseif ($thname == 'price') {
                    //     if (!$criteria) {
                    //             $criteria = '`prices.price` LIKE \'%'.mysql_real_escape_string($query).'%\'';
                    //         }
                    //         else{
                    //             $criteria .= ' OR `prices.price` LIKE \'%'.mysql_real_escape_string($query).'%\'';
                    //         }
                    // }
                    else{
                        if (!$criteria) {
                        $criteria = 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                        else{
                               $criteria .= ' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                    }
                    
                        
                        // $this->data['criteria'] = $criteria;
                    
                }
            }
            
            // if (!(($role == 'all')or($role == null))) {
            //     if ($criteria) {
                    // $criteria = '('.$criteria.')'.'AND `user_role_id` LIKE \'%'.mysql_real_escape_string($idRole).'%\'';
            //     }
            //     else{
            //         $criteria = '`user_role_id` LIKE \'%'.mysql_real_escape_string($idRole).'%\'';
            //     }
                
            // }
            if (!$criteria) {
                // $users = $mySql->getRecords('horses', array('domain_id' => '37'));
                $users = $mySql->mixedselectDistinct('horses.name, horses.main_image,horses.id, prices.price,horses.sex,horses.age,horses.father,horses.status,horses.updated,horse_photos.filename,horses.domain_id, horses.price_id, horses.price_id', array('horses', 'prices','horse_photos'), 
                    '(horses.domain_id=37 and horses.main_image=horse_photos.id and horses.price_id=prices.id) or 
                    (horses.domain_id=37 and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1) or
                    (horses.domain_id=37 and horses.main_image=0 and horses.id=horse_photos.horse_id and horses.price_id=prices.id) or 
                    (horses.domain_id=37 and horses.main_image=0 and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1)','id')
                ->fetchAll();
            }
            else{
                // $criteria = '('.$criteria.')'.' AND `domain_id` LIKE '.mysql_real_escape_string('37');
                // $users = $mySql->getRecords('horses', $criteria, '`id`');
                $users = $mySql->mixedselectDistinct('horses.name, horses.main_image,horses.id, prices.price,horses.sex,horses.age,horses.father,horses.status,horses.updated,horse_photos.filename,horses.domain_id, horses.price_id, horses.price_id', array('horses', 'prices','horse_photos'), 
                    '((horses.domain_id=37 and horses.main_image=horse_photos.id and horses.price_id=prices.id) or 
                    (horses.domain_id=37 and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1) or
                    (horses.domain_id=37 and horses.main_image=0 and horses.id=horse_photos.horse_id and horses.price_id=prices.id) or 
                    (horses.domain_id=37 and horses.main_image=0 and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1))
                    and '.$criteria.'','id')
                ->fetchAll();
                
            }
            
            foreach ($users as $key2 => $value2) {

                if ($users[$key2]['main_image'] == '0') $users[$key2]['filename'] = null;
                if ($users[$key2]['price_id'] == '0') $users[$key2]['price'] = '';
            }

            $prices = $mySql->getRecords('prices', array('domain_id' => '37'));
            $horsesphotos = $mySql->getRecords('horse_photos', array('domain_id' => '37'));
            $this->data['users'] = $users;
            $this->data['prices'] = $prices;
            $this->data['horsesphotos'] = $horsesphotos;
            $this->data['criteria'] = $criteria;
            $this->data['queryupdated'] = $queryupdated;
            
        }
    }
        

?>