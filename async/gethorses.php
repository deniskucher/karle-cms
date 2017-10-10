<?php
 
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    class Basic_GetHorses_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
			// Extract inputs
            $query = $this->_getString('query', $_params, false);
            
            $thname_arr = $this->_getArray('search', $_params, false);
            
            $sexesen = array('mare' => '0', 'gelding'=> '1', 'stallion'=> '2');
            $sexesde = array('stute' => '0', 'wallach'=> '1', 'sengst'=> '2');
            $horsesCategoryDe = array('Springpferde' => '0',
                                      'Dressurpferde' => '1',
                                      'Spring- und Dressurpferde' => '2',
                                      'Fohlen' => '3',
                                      'Zuchtstuten' => '4',
                                      'Deckhengste' => '5',
                                      'Erfolgspferde' => '6',
                                      'Hunters' => '7');
            $horsesCategoryEn = array('Jumpers' => '0',
                                      'Dressage Horses' => '1',
                                      'Jumpers + Dressage Horses' => '2',
                                      'Foals' => '3',
                                      'Breeding Mares' => '4',
                                      'Stallions' => '5',
                                      'Successful Horses' => '6',
                                      'Hunters' => '7');
            
            if (!(($query == '')or($query == '*'))) {

                foreach ($thname_arr as $key => $thname) {
                    if ($thname == 'sex') {
                        $querysex = mb_strtolower($query);
                        foreach ($sexesen as $key1 => $value) {

                            if (strpos($key1, $querysex) !== false) {// именно через жесткое сравнение
                                $querysex = $key1; 
                                $querysex = $sexesen[$querysex];
                            }
                        }
                        
                        if (!$criteria) {
                            $criteria = 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($querysex).'%\'';
                        }
                        else{
                            $criteria .= ' OR horses.'.$thname.' LIKE \'%'.$querysex.'%\'';
                        }
                    }
                    
                    else if ($thname == 'sex_en') {
                        $querysex = mb_strtolower($query);
                        foreach ($sexesde as $key2 => $value2) {
                            
                            if (strpos($key2, $querysex) !== false) {// именно через жесткое сравнение
                                $querysex = $key2; 
                                $querysex = $sexesde[$querysex];
                            }
                        }
                        
                        if (!$criteria) {
                            $criteria = 'horses.sex LIKE \'%'.mysql_real_escape_string($querysex).'%\'';
                        }
                        else{
                            $criteria .= ' OR horses.sex LIKE \'%'.$querysex.'%\'';
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
                                $criteria .= 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($daysupdated).'%\' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($hoursupdated).'%\' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($minutesupdated).'%\'';
                            }
                            else{
                                $criteria .= ' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($daysupdated).'%\' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($hoursupdated).'%\' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($minutesupdated).'%\'';
                            }
                        }
                        
                    }
                    elseif ($thname == 'price') {
                        if (!$criteria) {
                                $criteria = 'prices.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                            }
                            else{
                                $criteria .= ' OR prices.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                            }
                    }
                    else if ($thname == 'category') {
                        $querycategoryde = mb_strtolower($query);
                        foreach ($horsesCategoryDe as $CategoryDekey => $CategoryDevalue) {
                            
                            if (strpos($CategoryDekey, $querycategoryde) !== false) {// именно через жесткое сравнение
                                $querycategoryde = $CategoryDekey; 
                                $querycategoryde = $horsesCategoryDe[$querycategoryde];
                            }
                        }
                        
                        if (!$criteria) {
                            $criteria = 'horses.category_id LIKE \'%'.mysql_real_escape_string($querycategoryde).'%\'';
                        }
                        else{
                            $criteria .= ' OR horses.category_id LIKE \'%'.$querycategoryde.'%\'';
                        }
                    }
                    else if ($thname == 'category_en') {
                        $querycategoryen = mb_strtolower($query);
                        foreach ($horsesCategoryEn as $CategoryEnkey => $CategoryEnValue) {
                            
                            if (strpos($CategoryEnkey, $querycategoryen) !== false) {// именно через жесткое сравнение
                                $querycategoryen = $CategoryEnkey; 
                                $querycategoryen = $horsesCategoryEn[$querycategoryen];
                            }
                        }
                        
                        if (!$criteria) {
                            $criteria = 'horses.category_id LIKE \'%'.mysql_real_escape_string($querycategoryen).'%\'';
                        }
                        else{
                            $criteria .= ' OR horses.category_id LIKE \'%'.$querycategoryen.'%\'';
                        }
                    }
                    else{
                        if (!$criteria) {
                        $criteria = 'horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                        else{
                               $criteria .= ' OR horses.'.$thname.' LIKE \'%'.mysql_real_escape_string($query).'%\'';
                        }
                    }
                    
                }
            }
            
            if (!$criteria) {
                
                $horses = $mySql->mixedselectDistinct('horses.name, horses.category_id, horses.main_image,horses.id, prices.price,horses.sex,horses.age,horses.father,horses.status,horses.updated,horse_photos.filename,horses.domain_id, horses.price_id', array('horses', 'prices','horse_photos'), 
                    '(horses.domain_id='.$_domainId.' and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=prices.id) or 
                    (horses.domain_id='.$_domainId.' and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1) or
                    (horses.domain_id='.$_domainId.' and horses.main_image=0 and horse_photos.domain_id=0 and horses.price_id=prices.id) or 
                    (horses.domain_id='.$_domainId.' and horses.main_image=0 and horse_photos.domain_id=0 and horses.price_id=0 and prices.id=1)','id')
                ->fetchAll();
            }
            else{
                
                $horses = $mySql->mixedselectDistinct('horses.name, horses.category_id, horses.main_image,horses.id, prices.price,horses.sex,horses.age,horses.father,horses.status,horses.updated,horse_photos.filename,horses.domain_id, horses.price_id', array('horses', 'prices','horse_photos'), 
                    '(horses.domain_id='.$_domainId.' and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=prices.id and ('.$criteria.')) or 
                    (horses.domain_id='.$_domainId.' and horses.main_image=horse_photos.id and horses.id=horse_photos.horse_id and horses.price_id=0 and prices.id=1 and ('.$criteria.')) or
                    (horses.domain_id='.$_domainId.' and horses.main_image=0 and horse_photos.domain_id=0 and horses.price_id=prices.id and ('.$criteria.')) or 
                    (horses.domain_id='.$_domainId.' and horses.main_image=0 and horse_photos.domain_id=0 and horses.price_id=0 and prices.id=1 and ('.$criteria.'))','id')
                ->fetchAll();
                
            }
            
            if (!$horses) {
                
                throw new AsyncActionException('Data not found.');

            }

            foreach ($horses as $key3 => $value3) {

                if ($horses[$key3]['main_image'] == '0') $horses[$key3]['filename'] = null;
                if ($horses[$key3]['price_id'] == '0') $horses[$key3]['price'] = '';
            }

            $this->data['tabledata'] = $horses;
            
        }
    }
        

?>