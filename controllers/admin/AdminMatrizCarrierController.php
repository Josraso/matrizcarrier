<?php

class AdminMatrizCarrierController extends ModuleAdminController
{
    public function __construct()
    {
        $this->bootstrap = true;
        $this->table = 'carrier';
        $this->className = 'Carrier';
        $this->identifier = 'id_carrier';
        $this->lang = false;
        $this->meta_title = $this->l('Matriz de Tarifas de Transporte');

        $this->fields_list = [
            'id_carrier' => [
                'title' => $this->l('ID'),
                'align' => 'center',
                'width' => 40,
            ],
            'name' => [
                'title' => $this->l('Nombre del transportista'),
                'width' => 140,
            ],
            'active' => [
                'title' => $this->l('Activo'),
                'active' => 'status',
                'type' => 'bool',
                'align' => 'center',
                'width' => 70,
            ],
            'is_free' => [
                'title' => $this->l('Gratis'),
                'type' => 'bool',
                'align' => 'center',
                'width' => 70,
            ],
        ];

        parent::__construct();

        $this->bulk_actions = [
            'delete' => [
                'text' => $this->l('Eliminar seleccionados'),
                'confirm' => $this->l('¿Está seguro de eliminar los elementos seleccionados?'),
            ],
        ];
    }

    public function renderList()
    {
        // Render estándar, sin ORDER BY manual, PrestaShop usará id_carrier
        return parent::renderList();
    }
}