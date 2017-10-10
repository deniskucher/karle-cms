<?php

    /**
     * Basic_GetAppUser_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Get application user action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.06.25
     */
    class Basic_GetAppUser_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform($_domainId = null, array $_params = array())
        {
            $mySql = Application::getService('basic.mysqlmanager');
            // $userId = isset($_SESSION['userId']) ? $_SESSION['userId'] : null;
            $userId = $_SESSION;
            $this->data['user'] = $userId;
            // $user = is_null($userId) ? null : $mySql->getRecordById('users', $userId);
            //if ($user['avatar']) $user['avatar'] = UPLOADS_DIR_URL.'users/'.$user['avatar'];
            // $this->data['user'] = $user;
        }
        
    }

?>