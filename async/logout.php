<?php

    /**
     * Basic_Logout_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Logout action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.05.21
     */
    class Basic_Logout_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            if (isset($_SESSION['userId']))
            {
                // $mySqlManager = Application::getService('basic.mysqlmanager');
                // // Reset online flag
                // $user = $_SESSION['user'];
                // $mySqlManager->update('users', array('online' => 0), array('id' => $user['id']));
                
                // Remove user from the session
                unset($_SESSION['userId']);
            }
        }
        
    }

?>