<?php
// matrizcarrier.php
if (!defined('_PS_VERSION_')) {
    exit;
}

class MatrizCarrier extends Module
{
    private $html = '';
    private $postErrors = array();

    public function __construct()
    {
        $this->name = 'matrizcarrier';
        $this->tab = 'shipping_logistics';
        $this->version = '2.0.0';
        $this->author = 'Tu nombre';
        $this->need_instance = 0;
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Matriz Carrier');
        $this->description = $this->l('Gestión avanzada y rápida de tarifas de transporte usando matriz editable.');
    }

    public function install()
{
	  // Desactivar emails temporalmente durante la instalación
    $oldMailMethod = Configuration::get('PS_MAIL_METHOD');
    Configuration::updateValue('PS_MAIL_METHOD', 3); // Desactivar emails
    
    // Crear tablas adicionales para reglas y plantillas
    $sql = array();
  
    
    $sql[] = 'CREATE TABLE IF NOT EXISTS `'._DB_PREFIX_.'matrizcarrier_rules` (
        `id_rule` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `type` varchar(50) NOT NULL,
        `conditions` TEXT,
        `actions` TEXT,
        `priority` int(11) DEFAULT 0,
        `active` tinyint(1) DEFAULT 1,
        `date_add` datetime NOT NULL,
        `date_upd` datetime NOT NULL,
        PRIMARY KEY (`id_rule`)
    ) ENGINE='._MYSQL_ENGINE_.' DEFAULT CHARSET=utf8;';

    $sql[] = 'CREATE TABLE IF NOT EXISTS `'._DB_PREFIX_.'matrizcarrier_templates` (
        `id_template` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `description` TEXT,
        `data` LONGTEXT,
        `is_default` tinyint(1) DEFAULT 0,
        `date_add` datetime NOT NULL,
        PRIMARY KEY (`id_template`)
    ) ENGINE='._MYSQL_ENGINE_.' DEFAULT CHARSET=utf8;';

    $sql[] = 'CREATE TABLE IF NOT EXISTS `'._DB_PREFIX_.'matrizcarrier_history` (
        `id_history` int(11) NOT NULL AUTO_INCREMENT,
        `id_carrier` int(11) NOT NULL,
        `id_employee` int(11),
        `action` varchar(50) NOT NULL,
        `details` TEXT,
        `date_add` datetime NOT NULL,
        PRIMARY KEY (`id_history`)
    ) ENGINE='._MYSQL_ENGINE_.' DEFAULT CHARSET=utf8;';

    foreach ($sql as $query) {
        if (!Db::getInstance()->execute($query)) {
            return false;
        }
    }

    // Instalar plantillas por defecto
    $this->installDefaultTemplates();

    // Instalación manual sin parent::install()
    return Db::getInstance()->insert('module', array(
        'name' => $this->name,
        'active' => 1,
        'version' => $this->version
    )) && Configuration::updateValue('MATRIZCARRIER_LIVE_MODE', false);
}

    public function uninstall()
    {
        $sql = array();
        $sql[] = 'DROP TABLE IF EXISTS `'._DB_PREFIX_.'matrizcarrier_rules`';
        $sql[] = 'DROP TABLE IF EXISTS `'._DB_PREFIX_.'matrizcarrier_templates`';
        $sql[] = 'DROP TABLE IF EXISTS `'._DB_PREFIX_.'matrizcarrier_history`';

        foreach ($sql as $query) {
            Db::getInstance()->execute($query);
        }

        Configuration::deleteByName('MATRIZCARRIER_LIVE_MODE');

        return parent::uninstall();
    }

private function installDefaultTemplates()
{
    $templates = array(
        array(
            'name' => 'Envío Peninsular Estándar',
            'description' => 'Tarifas estándar para envíos en península',
            'data' => json_encode(array(
                'ranges' => array('0-1', '1-5', '5-10', '10-20', '20-30'),
                'zones' => array(
                    'España' => array(3.95, 5.95, 7.95, 12.95, 18.95),
                    'Portugal' => array(8.95, 12.95, 16.95, 24.95, 34.95)
                )
            )),
            'is_default' => 1
        ),
        array(
            'name' => 'Envío Express',
            'description' => 'Tarifas para envíos urgentes 24-48h',
            'data' => json_encode(array(
                'ranges' => array('0-2', '2-10', '10-30'),
                'zones' => array(
                    'España' => array(9.95, 14.95, 29.95),
                    'Portugal' => array(19.95, 29.95, 49.95),
                    'Francia' => array(24.95, 39.95, 69.95)
                )
            )),
            'is_default' => 0
        ),
        array(
            'name' => 'Envío Islas',
            'description' => 'Tarifas especiales para Baleares y Canarias',
            'data' => json_encode(array(
                'ranges' => array('0-5', '5-15', '15-30'),
                'zones' => array(
                    'Baleares' => array(12.95, 19.95, 34.95),
                    'Canarias' => array(18.95, 29.95, 49.95)
                )
            )),
            'is_default' => 0
        )
    );

    foreach ($templates as $template) {
        Db::getInstance()->insert('matrizcarrier_templates', array(
            'name' => $template['name'],
            'description' => $template['description'],
            'data' => $template['data'],
            'is_default' => isset($template['is_default']) ? $template['is_default'] : 0,
            'date_add' => date('Y-m-d H:i:s')
        ));
    }
}

    public function getContent()
    {
        $this->context->controller->addCSS($this->_path.'views/css/matrizcarrier.css');
        $this->context->controller->addCSS($this->_path.'views/css/wizard.css');
        $this->context->controller->addJS($this->_path.'views/js/matrizcarrier.js');
        $this->context->controller->addJS($this->_path.'views/js/wizard.js');
        $this->context->controller->addJS($this->_path.'views/js/rules.js');
        $this->context->controller->addJS($this->_path.'views/js/visual-range-editor.js');
        
        // Añadir librerías externas
        $this->context->controller->addJS('https://cdnjs.cloudflare.com/ajax/libs/sortablejs/1.15.0/Sortable.min.js');
        $this->context->controller->addJS('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js');
        
        $output = '';
        $carrier_id = (int)Tools::getValue('carrier_id', 0);
        $action = Tools::getValue('action', 'matrix');

        // Procesar acciones según el tipo
        if (Tools::isSubmit('submitAction')) {
            $output .= $this->processAction();
        }
// Manejar peticiones AJAX
if (Tools::getValue('action') && Tools::isSubmit('ajax')) {
    $this->handleAjaxRequest();
    exit;
}
        // Renderizar según la acción
        switch ($action) {
            case 'wizard':
                $output .= $this->renderWizard();
                break;
                
            case 'rules':
                $output .= $this->renderRules();
                break;
                
            case 'visual_ranges':
                $output .= $this->renderVisualRanges($carrier_id);
                break;
                
            default:
                // Procesar acciones de matriz
                if (Tools::isSubmit('create_carrier')) {
                    $output .= $this->processCreateCarrier();
                }

                if (Tools::isSubmit('delete_range') && $carrier_id) {
                    $output .= $this->processDeleteRange($carrier_id);
                }

                if (Tools::isSubmit('save_matrizcarrier') && $carrier_id) {
                    $output .= $this->processSaveMatrix($carrier_id);
                }

                if (Tools::isSubmit('import_csv') && $carrier_id) {
                    $output .= $this->processImportCSV($carrier_id);
                }

                if (Tools::isSubmit('export_csv') && $carrier_id) {
                    $this->processExportCSV($carrier_id);
                    exit;
                }

                if (Tools::isSubmit('apply_template') && $carrier_id) {
                    $output .= $this->processApplyTemplate($carrier_id);
                }

                if (Tools::isSubmit('save_as_template') && $carrier_id) {
                    $output .= $this->processSaveAsTemplate($carrier_id);
                }

                if (Tools::isSubmit('apply_rules') && $carrier_id) {
                    $output .= $this->processApplyRules($carrier_id);
                }

                // Mostrar formulario principal
                $output .= $this->renderForm($carrier_id);
                break;
        }

        return $output;
    }

    private function processCreateCarrier()
    {
        $name = Tools::getValue('new_carrier_name');
        if ($name) {
            $carrier = new Carrier();
            $carrier->name = $name;
            $carrier->active = 1;
            $carrier->is_module = 0;
            $carrier->shipping_external = 0;
            $carrier->shipping_handling = 1;
            $carrier->range_behavior = 0;
            $carrier->delay = [Configuration::get('PS_LANG_DEFAULT') => 'Entrega estándar'];
            
            if ($carrier->add()) {
                // Asociar a todas las zonas activas por defecto
                $zones = $this->getZones();
                foreach ($zones as $zone) {
                    Db::getInstance()->insert('carrier_zone', [
                        'id_carrier' => (int)$carrier->id,
                        'id_zone' => (int)$zone['id_zone']
                    ]);
                }
                
                // Registrar en historial
                $this->addHistory($carrier->id, 'create_carrier', 'Transportista creado: ' . $name);
                
                // Redirigir para seleccionar el nuevo transportista
                Tools::redirectAdmin($this->context->link->getAdminLink('AdminModules', true).'&configure='.$this->name.'&carrier_id='.$carrier->id);
            } else {
                return $this->displayError($this->l('Error al crear el transportista'));
            }
        }
        return '';
    }

    private function processDeleteRange($carrier_id)
    {
        $range_id = (int)Tools::getValue('range_id');
        if ($range_id) {
            // Obtener información del rango antes de eliminar
            $range = Db::getInstance()->getRow('
                SELECT * FROM '._DB_PREFIX_.'range_weight 
                WHERE id_range_weight = '.$range_id
            );
            
            Db::getInstance()->execute('DELETE FROM '._DB_PREFIX_.'delivery WHERE id_range_weight = '.$range_id);
            Db::getInstance()->execute('DELETE FROM '._DB_PREFIX_.'range_weight WHERE id_range_weight = '.$range_id);
            
            $this->addHistory($carrier_id, 'delete_range', sprintf('Rango eliminado: %s-%s kg', $range['delimiter1'], $range['delimiter2']));
            
            return $this->displayConfirmation($this->l('Rango eliminado'));
        }
        return '';
    }

    private function processSaveMatrix($carrier_id)
{
    // Validar carrier_id
    if (!$carrier_id || !Validate::isUnsignedId($carrier_id)) {
        return $this->displayError($this->l('ID de transportista inválido'));
    }
    
    $changes = 0;
        
        // Añadir nuevo rango si se proporcionó
        $range_from = (float)Tools::getValue('range_from');
        $range_to = (float)Tools::getValue('range_to');
        
        if ($range_from >= 0 && $range_to > $range_from) {
            // Verificar que no se solape con rangos existentes
            $overlap = Db::getInstance()->getValue('
                SELECT COUNT(*) FROM '._DB_PREFIX_.'range_weight 
                WHERE id_carrier = '.(int)$carrier_id.' 
                AND ((delimiter1 <= '.$range_from.' AND delimiter2 > '.$range_from.')
                OR (delimiter1 < '.$range_to.' AND delimiter2 >= '.$range_to.')
                OR (delimiter1 >= '.$range_from.' AND delimiter2 <= '.$range_to.'))
            ');
            
            if ($overlap) {
                $this->postErrors[] = $this->l('El rango se solapa con uno existente');
            } else {
                $result = Db::getInstance()->insert('range_weight', [
                    'id_carrier' => $carrier_id,
                    'delimiter1' => $range_from,
                    'delimiter2' => $range_to,
                ]);
                
                if ($result) {
                    $this->addHistory($carrier_id, 'add_range', sprintf('Rango añadido: %s-%s kg', $range_from, $range_to));
                }
            }
        }
        
        // Guardar precios
        $zones = $this->getZones();
        $ranges = $this->getRanges($carrier_id);

        foreach ($zones as $zone) {
            foreach ($ranges as $range) {
                $key = 'price_'.$zone['id_zone'].'_'.$range['id_range_weight'];
                
                if (Tools::isSubmit($key)) {
                    $price = (float)Tools::getValue($key);
                    
                    // Verificar si existe
                    $exists = Db::getInstance()->getValue('
                        SELECT COUNT(*) FROM '._DB_PREFIX_.'delivery 
                        WHERE id_carrier = '.(int)$carrier_id.' 
                        AND id_zone = '.(int)$zone['id_zone'].' 
                        AND id_range_weight = '.(int)$range['id_range_weight']
                    );
                    
                    if ($exists) {
                        $result = Db::getInstance()->update('delivery', 
                            ['price' => $price], 
                            'id_carrier = '.(int)$carrier_id.' 
                            AND id_zone = '.(int)$zone['id_zone'].' 
                            AND id_range_weight = '.(int)$range['id_range_weight']
                        );
                        if ($result) $changes++;
                    } else if ($price > 0) {
                        $result = Db::getInstance()->insert('delivery', [
                            'id_carrier' => (int)$carrier_id,
                            'id_zone' => (int)$zone['id_zone'],
                            'id_range_weight' => (int)$range['id_range_weight'],
                            'id_range_price' => 0,
                            'price' => $price,
                        ]);
                        if ($result) $changes++;
                    }
                }
            }
        }
        
        // Asegurar que el transportista esté asociado a las zonas
        $this->associateCarrierToZones($carrier_id);
        
        if ($changes > 0) {
            $this->addHistory($carrier_id, 'update_matrix', sprintf('%d precios actualizados', $changes));
        }
        
        if (count($this->postErrors)) {
            return $this->displayError(implode('<br>', $this->postErrors));
        }
        
        return $this->displayConfirmation($this->l('Tarifas actualizadas correctamente'));
    }

    private function processImportCSV($carrier_id)
    {
        if (!isset($_FILES['import_csv_file']) || $_FILES['import_csv_file']['error'] != 0) {
            return $this->displayError($this->l('Error al cargar el archivo'));
        }

        $file = fopen($_FILES['import_csv_file']['tmp_name'], 'r');
        
        // Detectar delimitador
        $firstLine = fgets($file);
        rewind($file);
        $delimiter = $this->detectCSVDelimiter($firstLine);
        
        // Detectar encoding y convertir si es necesario
        $content = file_get_contents($_FILES['import_csv_file']['tmp_name']);
        $encoding = mb_detect_encoding($content, ['UTF-8', 'ISO-8859-1', 'Windows-1252']);
        
        if ($encoding !== 'UTF-8') {
            $content = mb_convert_encoding($content, 'UTF-8', $encoding);
            file_put_contents($_FILES['import_csv_file']['tmp_name'], $content);
            $file = fopen($_FILES['import_csv_file']['tmp_name'], 'r');
        }
        
        $header = fgetcsv($file, 0, $delimiter);

        // Modo de importación
        $import_mode = Tools::getValue('import_mode', 'replace');
        
        if ($import_mode == 'replace') {
            // Limpiar todos los precios existentes
            Db::getInstance()->execute('
                DELETE d FROM '._DB_PREFIX_.'delivery d
                INNER JOIN '._DB_PREFIX_.'range_weight rw ON rw.id_range_weight = d.id_range_weight
                WHERE rw.id_carrier = '.(int)$carrier_id
            );
        }

        // Primero, obtener los rangos existentes
        $existing_ranges = Db::getInstance()->executeS('
            SELECT id_range_weight, delimiter1, delimiter2 
            FROM '._DB_PREFIX_.'range_weight 
            WHERE id_carrier = '.(int)$carrier_id
        );
        
        $existing_map = [];
        foreach ($existing_ranges as $range) {
            $key = (float)$range['delimiter1'] . '-' . (float)$range['delimiter2'];
            $existing_map[$key] = $range['id_range_weight'];
        }

        // Crear nuevos rangos y mapear todos los del CSV
        $csv_ranges = [];
        $ranges = [];
        for ($i = 1; $i < count($header); $i++) {
            $header_clean = trim($header[$i]);
            if (preg_match('/^([0-9\.]+)\s*-\s*([0-9\.]+)/', $header_clean, $matches)) {
                $from = (float)$matches[1];
                $to = (float)$matches[2];
                $key = $from . '-' . $to;
                $csv_ranges[] = $key;
                
                if (isset($existing_map[$key])) {
                    $id_range = $existing_map[$key];
                } else {
                    // Verificar si ya existe antes de insertar
                    $check = Db::getInstance()->getValue('
                        SELECT id_range_weight FROM '._DB_PREFIX_.'range_weight 
                        WHERE id_carrier = '.(int)$carrier_id.' 
                        AND delimiter1 = '.$from.' 
                        AND delimiter2 = '.$to
                    );
                    
                    if ($check) {
                        $id_range = $check;
                    } else {
                        Db::getInstance()->insert('range_weight', [
                            'id_carrier' => (int)$carrier_id,
                            'delimiter1' => $from,
                            'delimiter2' => $to,
                        ]);
                        $id_range = Db::getInstance()->Insert_ID();
                    }
                }
                $ranges[$i] = $id_range;
            }
        }

        // Si el modo es replace, eliminar rangos que no están en el CSV
        if ($import_mode == 'replace') {
            foreach ($existing_map as $key => $id_range) {
                if (!in_array($key, $csv_ranges)) {
                    // Eliminar precios asociados
                    Db::getInstance()->execute('DELETE FROM '._DB_PREFIX_.'delivery WHERE id_range_weight = '.(int)$id_range);
                    // Eliminar rango
                    Db::getInstance()->execute('DELETE FROM '._DB_PREFIX_.'range_weight WHERE id_range_weight = '.(int)$id_range);
                }
            }
        }

        // Mapear zonas activas (case-insensitive y sin acentos)
        $zones = [];
        foreach ($this->getZones() as $zone) {
            $zone_key = $this->normalizeString($zone['name']);
            $zones[$zone_key] = $zone['id_zone'];
        }

        // Importar precios
        rewind($file);
        fgetcsv($file, 0, $delimiter); // Saltar header
        
        $imported = 0;
        $skipped = 0;
        
        while (($data = fgetcsv($file, 0, $delimiter)) !== false) {
            $zone_name = $this->normalizeString(trim($data[0]));
            
            if (!isset($zones[$zone_name])) {
                $skipped++;
                continue;
            }
            
            $zone_id = $zones[$zone_name];
            
            for ($i = 1; $i < count($data); $i++) {
                if (!isset($ranges[$i]) || trim($data[$i]) === '') continue;
                
                $price_str = trim($data[$i]);
                $price_str = str_replace(',', '.', $price_str);
                $price_str = preg_replace('/[^0-9.]/', '', $price_str);
                $price = (float)$price_str;
                
                if ($price <= 0) continue;
                
                $id_range = $ranges[$i];
                
                // En modo merge, verificar si ya existe
                if ($import_mode == 'merge') {
                    $exists = Db::getInstance()->getValue('
                        SELECT COUNT(*) FROM '._DB_PREFIX_.'delivery 
                        WHERE id_carrier = '.(int)$carrier_id.' 
                        AND id_zone = '.(int)$zone_id.' 
                        AND id_range_weight = '.(int)$id_range
                    );
                    
                    if ($exists) {
                        Db::getInstance()->update('delivery', 
                            ['price' => $price], 
                            'id_carrier = '.(int)$carrier_id.' 
                            AND id_zone = '.(int)$zone_id.' 
                            AND id_range_weight = '.(int)$id_range
                        );
                    } else {
                        Db::getInstance()->insert('delivery', [
                            'id_carrier' => (int)$carrier_id,
                            'id_zone' => (int)$zone_id,
                            'id_range_weight' => (int)$id_range,
                            'id_range_price' => 0,
                            'price' => $price,
                        ]);
                    }
                } else {
                    Db::getInstance()->insert('delivery', [
                        'id_carrier' => (int)$carrier_id,
                        'id_zone' => (int)$zone_id,
                        'id_range_weight' => (int)$id_range,
                        'id_range_price' => 0,
                        'price' => $price,
                    ]);
                }
                
                $imported++;
            }
        }
        fclose($file);
        
        // Asegurar que el transportista esté asociado a las zonas
        $this->associateCarrierToZones($carrier_id);
        
        $this->addHistory($carrier_id, 'import_csv', sprintf('CSV importado: %d precios, %d zonas omitidas', $imported, $skipped));
        
        $message = sprintf($this->l('Matriz importada correctamente. %d precios importados.'), $imported);
        if ($skipped > 0) {
            $message .= sprintf($this->l(' %d zonas no encontradas fueron omitidas.'), $skipped);
        }
        
        return $this->displayConfirmation($message);
    }

    private function processExportCSV($carrier_id)
    {
        $zones = $this->getZones();
        $ranges = $this->getRanges($carrier_id);
        $prices = $this->getPrices($carrier_id);
        
        // Opción de exportación
        $export_empty = Tools::getValue('export_empty_cells', true);
        $export_format = Tools::getValue('export_format', 'csv');

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=matrizcarrier_'.$carrier_id.'_'.date('Y-m-d').'.'.$export_format);
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

        $delimiter = ';';
        if ($export_format == 'csv_comma') {
            $delimiter = ',';
        }

        // Header
        $header = ['Zona'];
        foreach ($ranges as $range) {
            $header[] = $range['delimiter1'].'-'.$range['delimiter2'];
        }
        fputcsv($output, $header, $delimiter);

        // Data
        foreach ($zones as $zone) {
            // Solo exportar zonas con precios si se seleccionó
            if (!$export_empty) {
                $has_prices = false;
                foreach ($ranges as $range) {
                    if (isset($prices[$zone['id_zone']][$range['id_range_weight']]) && 
                        $prices[$zone['id_zone']][$range['id_range_weight']] > 0) {
                        $has_prices = true;
                        break;
                    }
                }
                if (!$has_prices) continue;
            }
            
            $row = [$zone['name']];
            foreach ($ranges as $range) {
                $price = isset($prices[$zone['id_zone']][$range['id_range_weight']]) 
                    ? number_format($prices[$zone['id_zone']][$range['id_range_weight']], 2, '.', '') 
                    : '';
                $row[] = $price;
            }
            fputcsv($output, $row, $delimiter);
        }
        fclose($output);
        
        $this->addHistory($carrier_id, 'export_csv', 'CSV exportado');
    }

    private function processApplyTemplate($carrier_id)
    {
        $template_id = (int)Tools::getValue('template_id');
        $template = Db::getInstance()->getRow('
            SELECT * FROM '._DB_PREFIX_.'matrizcarrier_templates 
            WHERE id_template = '.$template_id
        );
        
        if (!$template) {
            return $this->displayError($this->l('Plantilla no encontrada'));
        }
        
        $data = json_decode($template['data'], true);
        
        // Crear rangos si no existen
        foreach ($data['ranges'] as $range_str) {
            if (preg_match('/^([0-9\.]+)-([0-9\.]+)$/', $range_str, $matches)) {
                $from = (float)$matches[1];
                $to = (float)$matches[2];
                
                // Verificar si existe
                $exists = Db::getInstance()->getValue('
                    SELECT id_range_weight FROM '._DB_PREFIX_.'range_weight 
                    WHERE id_carrier = '.(int)$carrier_id.' 
                    AND delimiter1 = '.$from.' 
                    AND delimiter2 = '.$to
                );
                
                if (!$exists) {
                    Db::getInstance()->insert('range_weight', [
                        'id_carrier' => (int)$carrier_id,
                        'delimiter1' => $from,
                        'delimiter2' => $to,
                    ]);
                }
            }
        }
        
        // Obtener mapeo de zonas
        $zones = [];
        foreach ($this->getZones() as $zone) {
            $zones[$zone['name']] = $zone['id_zone'];
        }
        
        // Obtener rangos actualizados
        $ranges = $this->getRanges($carrier_id);
        $range_map = [];
        foreach ($ranges as $range) {
            $key = $range['delimiter1'].'-'.$range['delimiter2'];
            $range_map[$key] = $range['id_range_weight'];
        }
        
        // Aplicar precios
        foreach ($data['zones'] as $zone_name => $prices) {
            if (!isset($zones[$zone_name])) continue;
            
            $zone_id = $zones[$zone_name];
            
            foreach ($data['ranges'] as $i => $range_str) {
                if (!isset($range_map[$range_str]) || !isset($prices[$i])) continue;
                
                $range_id = $range_map[$range_str];
                $price = (float)$prices[$i];
                
                if ($price <= 0) continue;
                
                // Verificar si existe
                $exists = Db::getInstance()->getValue('
                    SELECT COUNT(*) FROM '._DB_PREFIX_.'delivery 
                    WHERE id_carrier = '.(int)$carrier_id.' 
                    AND id_zone = '.(int)$zone_id.' 
                    AND id_range_weight = '.(int)$range_id
                );
                
                if ($exists) {
                    Db::getInstance()->update('delivery', 
                        ['price' => $price], 
                        'id_carrier = '.(int)$carrier_id.' 
                        AND id_zone = '.(int)$zone_id.' 
                        AND id_range_weight = '.(int)$range_id
                    );
                } else {
                    Db::getInstance()->insert('delivery', [
                        'id_carrier' => (int)$carrier_id,
                        'id_zone' => (int)$zone_id,
                        'id_range_weight' => (int)$range_id,
                        'id_range_price' => 0,
                        'price' => $price,
                    ]);
                }
            }
        }
        
        $this->associateCarrierToZones($carrier_id);
        $this->addHistory($carrier_id, 'apply_template', 'Plantilla aplicada: ' . $template['name']);
        
        return $this->displayConfirmation($this->l('Plantilla aplicada correctamente'));
    }

    private function processSaveAsTemplate($carrier_id)
    {
        $name = Tools::getValue('template_name');
        $description = Tools::getValue('template_description');
        
        if (!$name) {
            return $this->displayError($this->l('El nombre de la plantilla es obligatorio'));
        }
        
        // Obtener datos actuales
        $ranges = $this->getRanges($carrier_id);
        $zones = $this->getZones();
        $prices = $this->getPrices($carrier_id);
        
        // Preparar estructura de datos
        $template_data = array(
            'ranges' => array(),
            'zones' => array()
        );
        
        foreach ($ranges as $range) {
            $template_data['ranges'][] = $range['delimiter1'].'-'.$range['delimiter2'];
        }
        
        foreach ($zones as $zone) {
            $zone_prices = array();
            foreach ($ranges as $range) {
                $price = isset($prices[$zone['id_zone']][$range['id_range_weight']]) 
                    ? $prices[$zone['id_zone']][$range['id_range_weight']] 
                    : 0;
                $zone_prices[] = $price;
            }
            
            // Solo guardar zonas con al menos un precio
            if (array_sum($zone_prices) > 0) {
                $template_data['zones'][$zone['name']] = $zone_prices;
            }
        }
        
        // Guardar plantilla
        $result = Db::getInstance()->insert('matrizcarrier_templates', array(
            'name' => pSQL($name),
            'description' => pSQL($description),
            'data' => json_encode($template_data),
            'is_default' => 0,
            'date_add' => date('Y-m-d H:i:s')
        ));
        
        if ($result) {
            $this->addHistory($carrier_id, 'save_template', 'Plantilla guardada: ' . $name);
            return $this->displayConfirmation($this->l('Plantilla guardada correctamente'));
        }
        
        return $this->displayError($this->l('Error al guardar la plantilla'));
    }

    private function processApplyRules($carrier_id)
    {
        $rule_ids = Tools::getValue('rule_ids');
        if (!is_array($rule_ids) || empty($rule_ids)) {
            return $this->displayError($this->l('Selecciona al menos una regla'));
        }
        
        $applied = 0;
        $errors = array();
        
        foreach ($rule_ids as $rule_id) {
            $rule = $this->getRule((int)$rule_id);
            if (!$rule || !$rule['active']) continue;
            
            $result = $this->applyRule($rule, $carrier_id);
            if ($result['success']) {
                $applied += $result['affected'];
            } else {
                $errors[] = sprintf($this->l('Error en regla "%s": %s'), $rule['name'], $result['error']);
            }
        }
        
        if ($applied > 0) {
            $this->addHistory($carrier_id, 'apply_rules', sprintf('%d reglas aplicadas, %d precios afectados', count($rule_ids), $applied));
        }
        
        if (!empty($errors)) {
            return $this->displayError(implode('<br>', $errors));
        }
        
        return $this->displayConfirmation(sprintf($this->l('Reglas aplicadas correctamente. %d precios actualizados'), $applied));
    }

    private function applyRule($rule, $carrier_id)
    {
        $conditions = json_decode($rule['conditions'], true);
        $actions = json_decode($rule['actions'], true);
        $affected = 0;
        
        try {
            $zones = $this->getZones();
            $ranges = $this->getRanges($carrier_id);
            $prices = $this->getPrices($carrier_id);
            
            foreach ($zones as $zone) {
                foreach ($ranges as $range) {
                    // Evaluar condiciones
                    if (!$this->evaluateConditions($conditions, $zone, $range, $prices)) {
                        continue;
                    }
                    
                    // Aplicar acciones
                    $new_price = $this->calculateNewPrice($actions, $zone, $range, $prices);
                    
                    if ($new_price !== null) {
                        // Actualizar precio
                        $exists = Db::getInstance()->getValue('
                            SELECT COUNT(*) FROM '._DB_PREFIX_.'delivery 
                            WHERE id_carrier = '.(int)$carrier_id.' 
                            AND id_zone = '.(int)$zone['id_zone'].' 
                            AND id_range_weight = '.(int)$range['id_range_weight']
                        );
                        
                        if ($exists) {
                            Db::getInstance()->update('delivery', 
                                ['price' => $new_price], 
                                'id_carrier = '.(int)$carrier_id.' 
                                AND id_zone = '.(int)$zone['id_zone'].' 
                                AND id_range_weight = '.(int)$range['id_range_weight']
                            );
                        } else if ($new_price > 0) {
                            Db::getInstance()->insert('delivery', [
                                'id_carrier' => (int)$carrier_id,
                                'id_zone' => (int)$zone['id_zone'],
                                'id_range_weight' => (int)$range['id_range_weight'],
                                'id_range_price' => 0,
                                'price' => $new_price,
                            ]);
                        }
                        
                        $affected++;
                    }
                }
            }
            
            return array('success' => true, 'affected' => $affected);
            
        } catch (Exception $e) {
            return array('success' => false, 'error' => $e->getMessage());
        }
    }

    private function evaluateConditions($conditions, $zone, $range, $prices)
    {
        if (empty($conditions)) return true;
        
        foreach ($conditions as $condition) {
            $field = $condition['field'];
            $operator = $condition['operator'];
            $value = $condition['value'];
            
            switch ($field) {
                case 'zone_name':
                    if (!$this->evaluateStringCondition($zone['name'], $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'zone_active':
                    if ($zone['active'] != $value) {
                        return false;
                    }
                    break;
                    
                case 'weight_from':
                    if (!$this->evaluateNumericCondition($range['delimiter1'], $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'weight_to':
                    if (!$this->evaluateNumericCondition($range['delimiter2'], $operator, $value)) {
                        return false;
                    }
                    break;
                    
                case 'current_price':
                    $current = isset($prices[$zone['id_zone']][$range['id_range_weight']]) 
                        ? $prices[$zone['id_zone']][$range['id_range_weight']] 
                        : 0;
                    if (!$this->evaluateNumericCondition($current, $operator, $value)) {
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }

    private function evaluateStringCondition($field_value, $operator, $value)
    {
        switch ($operator) {
            case 'equals':
                return strcasecmp($field_value, $value) === 0;
            case 'contains':
                return stripos($field_value, $value) !== false;
            case 'starts_with':
                return stripos($field_value, $value) === 0;
            case 'ends_with':
                return substr(strtolower($field_value), -strlen($value)) === strtolower($value);
            case 'regex':
                return preg_match($value, $field_value);
        }
        return false;
    }

    private function evaluateNumericCondition($field_value, $operator, $value)
    {
        $field_value = (float)$field_value;
        $value = (float)$value;
        
        switch ($operator) {
            case 'equals':
                return $field_value == $value;
            case 'greater_than':
                return $field_value > $value;
            case 'less_than':
                return $field_value < $value;
            case 'greater_or_equal':
                return $field_value >= $value;
            case 'less_or_equal':
                return $field_value <= $value;
            case 'between':
                $values = explode(',', $value);
                return $field_value >= (float)$values[0] && $field_value <= (float)$values[1];
        }
        return false;
    }

    private function calculateNewPrice($actions, $zone, $range, $prices)
    {
        $current_price = isset($prices[$zone['id_zone']][$range['id_range_weight']]) 
            ? $prices[$zone['id_zone']][$range['id_range_weight']] 
            : 0;
        
        $new_price = $current_price;
        
        foreach ($actions as $action) {
            switch ($action['type']) {
                case 'set_price':
                    $new_price = (float)$action['value'];
                    break;
                    
                case 'increase_percent':
                    $new_price = $new_price * (1 + (float)$action['value'] / 100);
                    break;
                    
                case 'decrease_percent':
                    $new_price = $new_price * (1 - (float)$action['value'] / 100);
                    break;
                    
                case 'add_fixed':
                    $new_price = $new_price + (float)$action['value'];
                    break;
                    
                case 'multiply':
                    $new_price = $new_price * (float)$action['value'];
                    break;
                    
                case 'formula':
                    // Evaluar fórmula simple
                    $formula = $action['value'];
                    $formula = str_replace('{price}', $current_price, $formula);
                    $formula = str_replace('{weight_from}', $range['delimiter1'], $formula);
                    $formula = str_replace('{weight_to}', $range['delimiter2'], $formula);
                    $formula = str_replace('{weight_avg}', ($range['delimiter1'] + $range['delimiter2']) / 2, $formula);
                    
                    // Evaluar expresión matemática simple (solo operaciones básicas)
                    $new_price = $this->evaluateFormula($formula);
                    break;
            }
        }
        
        // Redondear según configuración
        $round_method = $action['round'] ?? 'normal';
        switch ($round_method) {
            case 'up':
                $new_price = ceil($new_price * 100) / 100;
                break;
            case 'down':
                $new_price = floor($new_price * 100) / 100;
                break;
            default:
                $new_price = round($new_price, 2);
        }
        
        return $new_price;
    }

    private function evaluateFormula($formula)
    {
        // Sanitizar fórmula
        $formula = preg_replace('/[^0-9\+\-\*\/\(\)\.]/', '', $formula);
        
        // Evaluar de forma segura
        try {
            $result = eval('return ' . $formula . ';');
            return is_numeric($result) ? $result : 0;
        } catch (Exception $e) {
            return 0;
        }
    }

    private function associateCarrierToZones($carrier_id)
    {
        // Obtener todas las zonas donde hay precios definidos
        $zones_with_prices = Db::getInstance()->executeS('
            SELECT DISTINCT d.id_zone 
            FROM '._DB_PREFIX_.'delivery d
            INNER JOIN '._DB_PREFIX_.'range_weight rw ON rw.id_range_weight = d.id_range_weight
            WHERE rw.id_carrier = '.(int)$carrier_id.' AND d.price > 0
        ');
        
        // Limpiar asociaciones existentes
        Db::getInstance()->execute('DELETE FROM '._DB_PREFIX_.'carrier_zone WHERE id_carrier = '.(int)$carrier_id);
        
        // Crear nuevas asociaciones
        foreach ($zones_with_prices as $zone) {
            Db::getInstance()->insert('carrier_zone', [
                'id_carrier' => (int)$carrier_id,
                'id_zone' => (int)$zone['id_zone']
            ]);
        }
        
        // También asegurar que el transportista esté marcado como activo si tiene precios
        if (count($zones_with_prices) > 0) {
            $carrier = new Carrier($carrier_id);
            if (Validate::isLoadedObject($carrier) && !$carrier->active) {
                $carrier->active = 1;
                $carrier->update();
            }
        }
    }

    private function getCarriers()
    {
        return Carrier::getCarriers($this->context->language->id, false, false, false, null, Carrier::ALL_CARRIERS);
    }

    private function getZones()
    {
        return Db::getInstance()->executeS('
            SELECT z.*, z.active as is_active 
            FROM '._DB_PREFIX_.'zone z 
            ORDER BY z.name ASC
        ');
    }

    private function getRanges($carrier_id)
    {
        return Db::getInstance()->executeS('
            SELECT * FROM '._DB_PREFIX_.'range_weight 
            WHERE id_carrier = '.(int)$carrier_id.' 
            ORDER BY delimiter1 ASC
        ');
    }

    private function getPrices($carrier_id)
    {
        $rows = Db::getInstance()->executeS('
            SELECT d.id_zone, d.id_range_weight, d.price
            FROM '._DB_PREFIX_.'delivery d
            INNER JOIN '._DB_PREFIX_.'range_weight rw ON rw.id_range_weight = d.id_range_weight
            WHERE rw.id_carrier = '.(int)$carrier_id
        );
        
        $prices = [];
        foreach ($rows as $row) {
            $prices[$row['id_zone']][$row['id_range_weight']] = $row['price'];
        }
        return $prices;
    }

    private function getTemplates()
    {
        return Db::getInstance()->executeS('
            SELECT * FROM '._DB_PREFIX_.'matrizcarrier_templates 
            ORDER BY is_default DESC, name ASC
        ');
    }

    private function getRules()
    {
        return Db::getInstance()->executeS('
            SELECT * FROM '._DB_PREFIX_.'matrizcarrier_rules 
            WHERE active = 1 
            ORDER BY priority DESC, name ASC
        ');
    }

    private function getRule($id_rule)
    {
        return Db::getInstance()->getRow('
            SELECT * FROM '._DB_PREFIX_.'matrizcarrier_rules 
            WHERE id_rule = '.(int)$id_rule
        );
    }

    private function getHistory($carrier_id, $limit = 50)
    {
        return Db::getInstance()->executeS('
            SELECT h.*, CONCAT(e.firstname, " ", e.lastname) as employee_name
            FROM '._DB_PREFIX_.'matrizcarrier_history h
            LEFT JOIN '._DB_PREFIX_.'employee e ON h.id_employee = e.id_employee
            WHERE h.id_carrier = '.(int)$carrier_id.'
            ORDER BY h.date_add DESC
            LIMIT '.(int)$limit
        );
    }

    private function addHistory($carrier_id, $action, $details = '')
    {
        return Db::getInstance()->insert('matrizcarrier_history', array(
            'id_carrier' => (int)$carrier_id,
            'id_employee' => isset($this->context->employee) ? (int)$this->context->employee->id : null,
            'action' => pSQL($action),
            'details' => pSQL($details),
            'date_add' => date('Y-m-d H:i:s')
        ));
    }

    private function detectCSVDelimiter($line)
    {
        $delimiters = array(';', ',', '\t', '|');
        $counts = array();
        
        foreach ($delimiters as $delimiter) {
            $counts[$delimiter] = substr_count($line, $delimiter);
        }
        
        return array_search(max($counts), $counts);
    }

    private function normalizeString($str)
    {
        $str = mb_strtolower($str, 'UTF-8');
        
        // Eliminar acentos
        $unwanted_array = array(
            'Š'=>'S', 'š'=>'s', 'Ž'=>'Z', 'ž'=>'z', 'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E',
            'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U',
            'Ú'=>'U', 'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss', 'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'æ'=>'a', 'ç'=>'c',
            'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o',
            'ö'=>'o', 'ø'=>'o', 'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ý'=>'y', 'þ'=>'b', 'ÿ'=>'y'
        );
        $str = strtr($str, $unwanted_array);
        
        // Eliminar espacios extras
        $str = trim($str);
        
        return $str;
    }

    public function renderForm($carrier_id)
    {
        $carriers = $this->getCarriers();
        $zones = $this->getZones();
        $ranges = $carrier_id ? $this->getRanges($carrier_id) : [];
        $prices = $carrier_id ? $this->getPrices($carrier_id) : [];
        $templates = $this->getTemplates();
        $rules = $this->getRules();
        $history = $carrier_id ? $this->getHistory($carrier_id) : [];

        $this->context->smarty->assign([
            'module_dir' => $this->_path,
            'carrier_id' => $carrier_id,
            'carriers' => $carriers,
            'zones' => $zones,
            'ranges' => $ranges,
            'prices' => $prices,
            'templates' => $templates,
            'rules' => $rules,
            'history' => $history,
            'currency' => $this->context->currency,
            'link' => $this->context->link,
            'current_url' => $this->context->link->getAdminLink('AdminModules', false)
                .'&configure='.$this->name
                .'&carrier_id='.$carrier_id
                .'&token='.Tools::getAdminTokenLite('AdminModules'),
        ]);

        return $this->display(__FILE__, 'views/templates/admin/configure.tpl');
    }

    private function renderWizard()
    {
        $templates = $this->getTemplates();
        
        $this->context->smarty->assign([
            'module_dir' => $this->_path,
            'templates' => $templates,
            'link' => $this->context->link,
            'back_url' => $this->context->link->getAdminLink('AdminModules', true).'&configure='.$this->name,
        ]);

        return $this->display(__FILE__, 'views/templates/admin/wizard.tpl');
    }

    private function renderRules()
    {
        $rules = Db::getInstance()->executeS('
            SELECT * FROM '._DB_PREFIX_.'matrizcarrier_rules 
            ORDER BY priority DESC, name ASC
        ');
        
        $this->context->smarty->assign([
            'module_dir' => $this->_path,
            'rules' => $rules,
            'link' => $this->context->link,
            'back_url' => $this->context->link->getAdminLink('AdminModules', true).'&configure='.$this->name,
        ]);

        return $this->display(__FILE__, 'views/templates/admin/rules.tpl');
    }

    private function renderVisualRanges($carrier_id)
    {
        $ranges = $carrier_id ? $this->getRanges($carrier_id) : [];
        
        $this->context->smarty->assign([
            'module_dir' => $this->_path,
            'carrier_id' => $carrier_id,
            'ranges' => $ranges,
            'link' => $this->context->link,
            'back_url' => $this->context->link->getAdminLink('AdminModules', true).'&configure='.$this->name.'&carrier_id='.$carrier_id,
        ]);

        return $this->display(__FILE__, 'views/templates/admin/visual_ranges.tpl');
    }
	private function handleAjaxRequest()
{
    $action = Tools::getValue('action');
    $response = array('success' => false);
    
    switch ($action) {
        case 'save_rule':
            $rule = json_decode(Tools::getValue('rule'), true);
            if ($rule) {
                try {
                    if (isset($rule['id']) && $rule['id']) {
                        // Actualizar regla existente
                        $result = Db::getInstance()->update('matrizcarrier_rules', array(
                            'name' => pSQL($rule['name']),
                            'type' => pSQL($rule['type']),
                            'conditions' => pSQL(json_encode($rule['conditions'])),
                            'actions' => pSQL(json_encode($rule['actions'])),
                            'priority' => (int)$rule['priority'],
                            'active' => (int)$rule['active'],
                            'date_upd' => date('Y-m-d H:i:s')
                        ), 'id_rule = '.(int)$rule['id']);
                    } else {
                        // Nueva regla
                        $result = Db::getInstance()->insert('matrizcarrier_rules', array(
                            'name' => pSQL($rule['name']),
                            'type' => pSQL($rule['type']),
                            'conditions' => pSQL(json_encode($rule['conditions'])),
                            'actions' => pSQL(json_encode($rule['actions'])),
                            'priority' => (int)$rule['priority'],
                            'active' => (int)$rule['active'],
                            'date_add' => date('Y-m-d H:i:s'),
                            'date_upd' => date('Y-m-d H:i:s')
                        ));
                    }
                    
                    $response['success'] = true;
                } catch (Exception $e) {
                    $response['message'] = 'Error al guardar: ' . $e->getMessage();
                }
            }
            break;
            
        case 'get_rules':
            $rules = Db::getInstance()->executeS('
                SELECT * FROM '._DB_PREFIX_.'matrizcarrier_rules 
                ORDER BY priority DESC, name ASC
            ');
            $response['success'] = true;
            $response['rules'] = $rules ? $rules : array();
            break;
            
        case 'get_rule':
            $rule_id = (int)Tools::getValue('rule_id');
            $rule = Db::getInstance()->getRow('
                SELECT * FROM '._DB_PREFIX_.'matrizcarrier_rules 
                WHERE id_rule = '.$rule_id
            );
            if ($rule) {
                $rule['conditions'] = json_decode($rule['conditions'], true);
                $rule['actions'] = json_decode($rule['actions'], true);
                $response['success'] = true;
                $response['rule'] = $rule;
            }
            break;
            
        case 'delete_rule':
            $rule_id = (int)Tools::getValue('rule_id');
            $result = Db::getInstance()->delete('matrizcarrier_rules', 'id_rule = '.$rule_id);
            $response['success'] = $result;
            break;
            
        case 'toggle_rule':
            $rule_id = (int)Tools::getValue('rule_id');
            $active = (int)Tools::getValue('active');
            $result = Db::getInstance()->update('matrizcarrier_rules', 
                array('active' => $active), 
                'id_rule = '.$rule_id
            );
            $response['success'] = $result;
            break;
            
        case 'update_priorities':
            $priorities = json_decode(Tools::getValue('priorities'), true);
            if (is_array($priorities)) {
                foreach ($priorities as $item) {
                    Db::getInstance()->update('matrizcarrier_rules', 
                        array('priority' => (int)$item['priority']), 
                        'id_rule = '.(int)$item['id']
                    );
                }
                $response['success'] = true;
            }
            break;
            
        case 'get_zones':
            $zones = $this->getZones();
            $response['success'] = true;
            $response['zones'] = $zones;
            break;
    }
    
    header('Content-Type: application/json');
die(json_encode($response));
}
}