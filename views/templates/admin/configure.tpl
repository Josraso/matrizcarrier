{* views/templates/admin/configure.tpl *}

<div class="matrizcarrier-container">
    <div class="row">
        <div class="col-lg-12">
            {* Selector de transportista y acciones principales *}
            <div class="panel">
                <div class="panel-heading">
                    <i class="icon-truck"></i> {l s='Gestión de Tarifas de Transporte' mod='matrizcarrier'}
                    <span class="panel-heading-action">
                        <a class="list-toolbar-btn" href="{$current_url}&action=wizard" title="{l s='Asistente de configuración' mod='matrizcarrier'}">
    <i class="icon-magic"></i> {l s='Asistente' mod='matrizcarrier'}
</a>
<a class="list-toolbar-btn" href="{$current_url}&action=rules" title="{l s='Gestionar reglas' mod='matrizcarrier'}">
    <i class="icon-gears"></i> {l s='Reglas' mod='matrizcarrier'}
</a>
                    </span>
                </div>
                
                <div class="panel-body">
                    <form method="post" action="{$current_url}" class="form-horizontal">
                        <div class="form-group">
                            <label class="control-label col-lg-3">{l s='Seleccionar transportista' mod='matrizcarrier'}</label>
                            <div class="col-lg-6">
                                <select name="carrier_id" id="carrier_id" class="form-control" onchange="this.form.submit()">
                                    <option value="0">{l s='-- Seleccionar transportista --' mod='matrizcarrier'}</option>
                                    {foreach from=$carriers item=carrier}
                                        <option value="{$carrier.id_carrier}" {if $carrier_id == $carrier.id_carrier}selected{/if}>
                                            {$carrier.name}
                                        </option>
                                    {/foreach}
                                </select>
                            </div>
                            <div class="col-lg-3">
                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#createCarrierModal">
                                    <i class="icon-plus"></i> {l s='Crear nuevo' mod='matrizcarrier'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            
            {if $carrier_id}
                {* Panel principal con pestañas *}
                <div class="panel">
                    <div class="panel-heading">
                        <i class="icon-cogs"></i> {l s='Configuración de' mod='matrizcarrier'}: <strong>{$carriers[$carrier_id].name|default:'Transportista'}</strong>
                    </div>
                    
                    {* Pestañas *}
                    <ul class="nav nav-tabs">
                        <li class="active">
                            <a href="#matrix-tab" data-toggle="tab">
                                <i class="icon-th"></i> {l s='Matriz de Precios' mod='matrizcarrier'}
                            </a>
                        </li>
                        <li>
                            <a href="#ranges-tab" data-toggle="tab">
                                <i class="icon-resize-horizontal"></i> {l s='Rangos de Peso' mod='matrizcarrier'}
                                <span class="badge">{$ranges|@count}</span>
                            </a>
                        </li>
                        <li>
                            <a href="#visual-ranges-tab" data-toggle="tab">
                                <i class="icon-eye-open"></i> {l s='Editor Visual' mod='matrizcarrier'}
                            </a>
                        </li>
                        <li>
                            <a href="#templates-tab" data-toggle="tab">
                                <i class="icon-copy"></i> {l s='Plantillas' mod='matrizcarrier'}
                            </a>
                        </li>
                        <li>
                            <a href="#import-export-tab" data-toggle="tab">
                                <i class="icon-exchange"></i> {l s='Importar/Exportar' mod='matrizcarrier'}
                            </a>
                        </li>
                        <li>
                            <a href="#stats-tab" data-toggle="tab">
                                <i class="icon-bar-chart"></i> {l s='Estadísticas' mod='matrizcarrier'}
                            </a>
                        </li>
                        <li>
                            <a href="#history-tab" data-toggle="tab">
                                <i class="icon-time"></i> {l s='Historial' mod='matrizcarrier'}
                            </a>
                        </li>
                    </ul>
                    
                    <div class="tab-content">
                        {* Pestaña de Matriz *}
                        <div class="tab-pane active" id="matrix-tab">
                            <form method="post" action="{$current_url}" class="form-horizontal">
                                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                                
                                {* Herramientas de matriz *}
                                <div class="matrix-tools">
                                    <div class="search-box">
                                        <i class="icon-search"></i>
                                        <input type="text" id="matrix-search" class="form-control" placeholder="{l s='Buscar zona, precio...' mod='matrizcarrier'}">
                                    </div>
                                    
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-default" id="apply-formula">
                                            <i class="icon-calculator"></i> {l s='Aplicar fórmula' mod='matrizcarrier'}
                                        </button>
                                        <button type="button" class="btn btn-default" id="fill-diagonal">
                                            <i class="icon-magic"></i> {l s='Rellenar diagonal' mod='matrizcarrier'}
                                        </button>
                                        <button type="button" class="btn btn-default" id="copy-zone">
                                            <i class="icon-copy"></i> {l s='Copiar zona' mod='matrizcarrier'}
                                        </button>
                                        <button type="button" class="btn btn-default" id="clear-all">
                                            <i class="icon-eraser"></i> {l s='Limpiar todo' mod='matrizcarrier'}
                                        </button>
                                    </div>
                                    
                                    <div class="pull-right">
                                        <button type="submit" name="save_matrizcarrier" class="btn btn-primary">
                                            <i class="icon-save"></i> {l s='Guardar cambios' mod='matrizcarrier'}
                                        </button>
                                    </div>
                                </div>
                                
                                {* Filtros *}
                                <div class="filter-controls">
                                    <label class="checkbox-inline">
                                        <input type="checkbox" id="hide-inactive-zones"> {l s='Ocultar zonas inactivas' mod='matrizcarrier'}
                                    </label>
                                    <label class="checkbox-inline">
                                        <input type="checkbox" id="hide-empty-zones"> {l s='Ocultar zonas sin precios' mod='matrizcarrier'}
                                    </label>
                                </div>
                                
                                <div id="filter-info" style="display: none;"></div>
                                <div id="search-results" style="display: none;"></div>
                                <div id="selection-info" style="display: none;"></div>
                                
                                {if $ranges|@count > 0}
                                    <div class="matrix-wrapper">
                                        <table class="table table-bordered matrix-table" id="matrizcarrier-matrix">
                                            <thead>
                                                <tr>
                                                    <th class="fixed-column zone-column">{l s='Zona / Peso' mod='matrizcarrier'}</th>
                                                    {foreach from=$ranges item=range}
                                                        <th class="text-center range-header price-column" data-range="{$range.id_range_weight}">
                                                            {$range.delimiter1|string_format:"%.2f"} - {$range.delimiter2|string_format:"%.2f"} kg
                                                            <a href="{$current_url}&delete_range=1&range_id={$range.id_range_weight}" 
                                                               onclick="return confirm('{l s='¿Eliminar este rango?' mod='matrizcarrier' js=1}');"
                                                               class="icon-trash"></a>
                                                        </th>
                                                    {/foreach}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {foreach from=$zones item=zone}
                                                    <tr class="zone-row" data-zone="{$zone.id_zone}" data-zone-name="{$zone.name}" data-zone-active="{$zone.is_active}">
                                                        <td class="zone-name fixed-column zone-column">
                                                            <strong>{$zone.name}</strong>
                                                            {if $zone.is_active == 0}
                                                                <span class="label label-warning">{l s='Inactiva' mod='matrizcarrier'}</span>
                                                            {/if}
                                                        </td>
                                                        {foreach from=$ranges item=range}
                                                            <td class="price-cell price-column" data-zone="{$zone.id_zone}" data-range="{$range.id_range_weight}">
                                                                <div class="input-group input-group-sm">
                                                                    <input type="number" 
                                                                           name="price_{$zone.id_zone}_{$range.id_range_weight}" 
                                                                           value="{if isset($prices[$zone.id_zone][$range.id_range_weight])}{$prices[$zone.id_zone][$range.id_range_weight]|string_format:"%.2f"}{/if}"
                                                                           step="0.01" 
                                                                           min="0"
                                                                           class="form-control price-input"
                                                                           data-original="{if isset($prices[$zone.id_zone][$range.id_range_weight])}{$prices[$zone.id_zone][$range.id_range_weight]|string_format:"%.2f"}{/if}">
                                                                    <span class="input-group-addon">{$currency->sign}</span>
                                                                </div>
                                                            </td>
                                                        {/foreach}
                                                    </tr>
                                                {/foreach}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div class="panel-footer">
                                        <div id="price-stats" class="pull-left"></div>
                                        <button type="submit" name="save_matrizcarrier" class="btn btn-primary pull-right">
                                            <i class="icon-save"></i> {l s='Guardar cambios' mod='matrizcarrier'}
                                        </button>
                                        <div class="clearfix"></div>
                                    </div>
                                {else}
                                    <div class="alert alert-info">
                                        <i class="icon-info-sign"></i> {l s='No hay rangos de peso definidos. Ve a la pestaña "Rangos de Peso" o usa el "Editor Visual" para añadir algunos.' mod='matrizcarrier'}
                                    </div>
                                {/if}
                            </form>
                        </div>
                        
                        {* Pestaña de Rangos *}
                        <div class="tab-pane" id="ranges-tab">
                            <form method="post" action="{$current_url}" class="form-horizontal">
                                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                                
                                <div class="form-group">
                                    <label class="control-label col-lg-3">{l s='Añadir nuevo rango' mod='matrizcarrier'}</label>
                                    <div class="col-lg-9">
                                        <div class="range-form-group">
                                            <div class="input-group">
                                                <input type="number" name="range_from" step="0.01" min="0" placeholder="{l s='Desde (kg)' mod='matrizcarrier'}" class="form-control">
                                                <span class="input-group-addon">kg</span>
                                            </div>
                                            <span style="margin: 0 10px;">-</span>
                                            <div class="input-group">
                                                <input type="number" name="range_to" step="0.01" min="0" placeholder="{l s='Hasta (kg)' mod='matrizcarrier'}" class="form-control">
                                                <span class="input-group-addon">kg</span>
                                            </div>
                                            <button type="submit" name="save_matrizcarrier" class="btn btn-primary">
                                                <i class="icon-plus"></i> {l s='Añadir rango' mod='matrizcarrier'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <div class="col-lg-12">
                                        <a href="{$current_url}&action=visual_ranges" class="btn btn-info">
                                            <i class="icon-eye-open"></i> {l s='Usar editor visual' mod='matrizcarrier'}
                                        </a>
                                    </div>
                                </div>
                            </form>
                            
                            {if $ranges|@count > 0}
                                <hr>
                                <h4>{l s='Rangos existentes' mod='matrizcarrier'}</h4>
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>{l s='Desde (kg)' mod='matrizcarrier'}</th>
                                            <th>{l s='Hasta (kg)' mod='matrizcarrier'}</th>
                                            <th>{l s='Zonas con precio' mod='matrizcarrier'}</th>
                                            <th>{l s='Precio medio' mod='matrizcarrier'}</th>
                                            <th>{l s='Acciones' mod='matrizcarrier'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foreach from=$ranges item=range}
                                            <tr>
                                                <td>{$range.delimiter1|string_format:"%.2f"}</td>
                                                <td>{$range.delimiter2|string_format:"%.2f"}</td>
                                                <td>
                                                    {assign var=count value=0}
                                                    {assign var=total value=0}
                                                    {foreach from=$prices item=zone_prices key=zone_id}
                                                        {if isset($zone_prices[$range.id_range_weight]) && $zone_prices[$range.id_range_weight] > 0}
                                                            {assign var=count value=$count+1}
                                                            {assign var=total value=$total+$zone_prices[$range.id_range_weight]}
                                                        {/if}
                                                    {/foreach}
                                                    <span class="badge">{$count}</span>
                                                </td>
                                                <td>
                                                    {if $count > 0}
                                                        {($total/$count)|string_format:"%.2f"} {$currency->sign}
                                                    {else}
                                                        -
                                                    {/if}
                                                </td>
                                                <td>
                                                    <a href="{$current_url}&delete_range=1&range_id={$range.id_range_weight}" 
                                                       class="btn btn-danger btn-sm"
                                                       onclick="return confirm('{l s='¿Eliminar este rango? Se eliminarán también todos los precios asociados.' mod='matrizcarrier' js=1}');">
                                                        <i class="icon-trash"></i> {l s='Eliminar' mod='matrizcarrier'}
                                                    </a>
                                                </td>
                                            </tr>
                                        {/foreach}
                                    </tbody>
                                </table>
                            {/if}
                        </div>
                        
                        {* Pestaña de Editor Visual *}
                        <div class="tab-pane" id="visual-ranges-tab">
                            <div class="alert alert-info">
                                <i class="icon-info-sign"></i> {l s='Usa el editor visual para crear y modificar rangos de forma intuitiva' mod='matrizcarrier'}
                            </div>
                            
                            <div class="text-center" style="padding: 40px;">
                                <h4>{l s='Editor Visual de Rangos' mod='matrizcarrier'}</h4>
                                <p>{l s='Crea y modifica rangos de peso de forma visual arrastrando y redimensionando' mod='matrizcarrier'}</p>
                                <a href="{$current_url}&action=visual_ranges" class="btn btn-primary btn-lg">
                                    <i class="icon-eye-open"></i> {l s='Abrir Editor Visual' mod='matrizcarrier'}
                                </a>
                            </div>
                        </div>
                        
                        {* Pestaña de Plantillas *}
                        <div class="tab-pane" id="templates-tab">
                            <div class="row">
                                <div class="col-lg-8">
                                    <h4>{l s='Plantillas disponibles' mod='matrizcarrier'}</h4>
                                    
                                    <div class="template-selector">
                                        <select id="template-select" class="form-control">
                                            <option value="">{l s='-- Seleccionar plantilla --' mod='matrizcarrier'}</option>
                                            {foreach from=$templates item=template}
                                                <option value="{$template.id_template}">
                                                    {$template.name}
                                                    {if $template.is_default} ({l s='Por defecto' mod='matrizcarrier'}){/if}
                                                </option>
                                            {/foreach}
                                        </select>
                                        <button type="button" id="apply-template-btn" class="btn btn-primary">
                                            <i class="icon-download"></i> {l s='Aplicar plantilla' mod='matrizcarrier'}
                                        </button>
                                    </div>
                                    
                                    <div id="template-preview" class="mt-20"></div>
                                    
                                    {foreach from=$templates item=template}
                                        <div class="template-card" data-template-id="{$template.id_template}">
                                            <div class="template-name">{$template.name}</div>
                                            {if $template.description}
                                                <div class="template-description">{$template.description}</div>
                                            {/if}
                                            <div class="template-actions">
                                                <button type="button" class="btn btn-sm btn-primary apply-template" data-template-id="{$template.id_template}">
                                                    <i class="icon-download"></i> {l s='Aplicar' mod='matrizcarrier'}
                                                </button>
                                                {if !$template.is_default}
                                                    <button type="button" class="btn btn-sm btn-danger delete-template" data-template-id="{$template.id_template}">
                                                        <i class="icon-trash"></i>
                                                    </button>
                                                {/if}
                                            </div>
                                        </div>
                                    {/foreach}
                                </div>
                                
                                <div class="col-lg-4">
                                    <div class="panel">
                                        <div class="panel-heading">
                                            <i class="icon-save"></i> {l s='Guardar como plantilla' mod='matrizcarrier'}
                                        </div>
                                        <div class="panel-body">
                                            <p>{l s='Guarda la configuración actual como una plantilla reutilizable' mod='matrizcarrier'}</p>
                                            <button type="button" id="save-as-template-btn" class="btn btn-success btn-block">
                                                <i class="icon-save"></i> {l s='Guardar configuración actual' mod='matrizcarrier'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {* Pestaña de Importar/Exportar *}
                        <div class="tab-pane" id="import-export-tab">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="panel">
                                        <div class="panel-heading">
                                            <i class="icon-download"></i> {l s='Exportar CSV' mod='matrizcarrier'}
                                        </div>
                                        <div class="panel-body">
                                            <p>{l s='Exporta la matriz actual a un archivo CSV para editarla en Excel o similar.' mod='matrizcarrier'}</p>
                                            
                                            <form method="post" action="{$current_url}">
                                                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                                                
                                                <div class="form-group">
                                                    <label>{l s='Opciones de exportación' mod='matrizcarrier'}</label>
                                                    <div class="checkbox">
                                                        <label>
                                                            <input type="checkbox" name="export_empty_cells" value="1" checked>
                                                            {l s='Incluir celdas vacías' mod='matrizcarrier'}
                                                        </label>
                                                    </div>
                                                    <div class="radio">
                                                        <label>
                                                            <input type="radio" name="export_format" value="csv" checked>
                                                            {l s='CSV con punto y coma (;)' mod='matrizcarrier'}
                                                        </label>
                                                    </div>
                                                    <div class="radio">
                                                        <label>
                                                            <input type="radio" name="export_format" value="csv_comma">
                                                            {l s='CSV con coma (,)' mod='matrizcarrier'}
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                <button type="submit" name="export_csv" class="btn btn-primary">
                                                    <i class="icon-download"></i> {l s='Descargar CSV' mod='matrizcarrier'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-lg-6">
                                    <div class="panel">
                                        <div class="panel-heading">
                                            <i class="icon-upload"></i> {l s='Importar CSV' mod='matrizcarrier'}
                                        </div>
                                        <div class="panel-body">
                                            <form method="post" action="{$current_url}" enctype="multipart/form-data">
                                                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                                                
                                                <div class="form-group">
                                                    <label>{l s='Archivo CSV' mod='matrizcarrier'}</label>
                                                    <input type="file" name="import_csv_file" accept=".csv" class="form-control" required>
                                                    <p class="help-block">
                                                        {l s='El archivo debe tener el mismo formato que el exportado.' mod='matrizcarrier'}<br>
                                                        {l s='Separador: punto y coma (;) o coma (,)' mod='matrizcarrier'}<br>
                                                        {l s='Primera columna: nombres de zonas' mod='matrizcarrier'}<br>
                                                        {l s='Primera fila: rangos de peso (ej: 0-5)' mod='matrizcarrier'}
                                                    </p>
                                                </div>
                                                
                                                <div class="form-group">
                                                    <label>{l s='Modo de importación' mod='matrizcarrier'}</label>
                                                    <div class="radio">
                                                        <label>
                                                            <input type="radio" name="import_mode" value="replace" checked>
                                                            {l s='Reemplazar todo (elimina precios actuales)' mod='matrizcarrier'}
                                                        </label>
                                                    </div>
                                                    <div class="radio">
                                                        <label>
                                                            <input type="radio" name="import_mode" value="merge">
                                                            {l s='Combinar (actualiza solo los precios del CSV)' mod='matrizcarrier'}
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                <button type="submit" name="import_csv" class="btn btn-primary">
                                                    <i class="icon-upload"></i> {l s='Importar' mod='matrizcarrier'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="panel">
                                <div class="panel-heading">
                                    <i class="icon-lightbulb"></i> {l s='Plantilla de ejemplo' mod='matrizcarrier'}
                                </div>
                                <div class="panel-body">
                                    <p>{l s='Formato del archivo CSV:' mod='matrizcarrier'}</p>
                                    <pre>Zona;0-1;1-5;5-10;10-20
España;3,95;5,95;7,95;12,95
Portugal;8,95;12,95;16,95;24,95
Francia;12,95;18,95;24,95;34,95
Alemania;14,95;20,95;26,95;36,95</pre>
                                    <p class="help-block">
                                        {l s='Los números decimales pueden usar punto (.) o coma (,)' mod='matrizcarrier'}<br>
                                        {l s='Las zonas no encontradas serán omitidas' mod='matrizcarrier'}<br>
                                        {l s='Se crearán automáticamente los rangos que no existan' mod='matrizcarrier'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {* Pestaña de Estadísticas *}
                        <div class="tab-pane" id="stats-tab">
                            <div class="stats-summary">
                                <div class="stat-card">
                                    <h3>{$zones|@count}</h3>
                                    <p>{l s='Zonas activas' mod='matrizcarrier'}</p>
                                </div>
                                <div class="stat-card">
                                    <h3>{$ranges|@count}</h3>
                                    <p>{l s='Rangos de peso' mod='matrizcarrier'}</p>
                                </div>
                                <div class="stat-card">
                                    <h3 id="total-prices">0</h3>
                                    <p>{l s='Precios definidos' mod='matrizcarrier'}</p>
                                </div>
                                <div class="stat-card">
                                    <h3 id="avg-price">0</h3>
                                    <p>{l s='Precio medio' mod='matrizcarrier'}</p>
                                </div>
                            </div>
                            
                            <div class="row mt-20">
                                <div class="col-lg-6">
                                    <div class="panel">
                                        <div class="panel-heading">
                                            <i class="icon-bar-chart"></i> {l s='Precios por zona' mod='matrizcarrier'}
                                        </div>
                                        <div class="panel-body">
                                            <canvas id="pricesByZoneChart" height="300"></canvas>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="panel">
                                        <div class="panel-heading">
                                            <i class="icon-pie-chart"></i> {l s='Distribución de precios' mod='matrizcarrier'}
                                        </div>
                                        <div class="panel-body">
                                            <canvas id="priceDistributionChart" height="300"></canvas>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {* Pestaña de Historial *}
                        <div class="tab-pane" id="history-tab">
                            {if $history|@count > 0}
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>{l s='Fecha' mod='matrizcarrier'}</th>
                                            <th>{l s='Usuario' mod='matrizcarrier'}</th>
                                            <th>{l s='Acción' mod='matrizcarrier'}</th>
                                            <th>{l s='Detalles' mod='matrizcarrier'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {foreach from=$history item=log}
                                            <tr>
                                                <td>{$log.date_add|date_format:"%d/%m/%Y %H:%M"}</td>
                                                <td>{$log.employee_name|default:'-'}</td>
                                                <td>
                                                    {if $log.action == 'update_matrix'}
                                                        <span class="label label-success">{l s='Actualizar matriz' mod='matrizcarrier'}</span>
                                                    {elseif $log.action == 'import_csv'}
                                                        <span class="label label-info">{l s='Importar CSV' mod='matrizcarrier'}</span>
                                                    {elseif $log.action == 'export_csv'}
                                                        <span class="label label-default">{l s='Exportar CSV' mod='matrizcarrier'}</span>
                                                    {elseif $log.action == 'add_range'}
                                                        <span class="label label-primary">{l s='Añadir rango' mod='matrizcarrier'}</span>
                                                    {elseif $log.action == 'delete_range'}
                                                        <span class="label label-danger">{l s='Eliminar rango' mod='matrizcarrier'}</span>
                                                    {elseif $log.action == 'apply_template'}
                                                        <span class="label label-info">{l s='Aplicar plantilla' mod='matrizcarrier'}</span>
                                                    {elseif $log.action == 'apply_rules'}
                                                        <span class="label label-warning">{l s='Aplicar reglas' mod='matrizcarrier'}</span>
                                                    {else}
                                                        {$log.action}
                                                    {/if}
                                                </td>
                                                <td>{$log.details|default:'-'}</td>
                                            </tr>
                                        {/foreach}
                                    </tbody>
                                </table>
                            {else}
                                <div class="alert alert-info">
                                    <i class="icon-info-sign"></i> {l s='No hay historial disponible' mod='matrizcarrier'}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {else}
                <div class="alert alert-warning">
                    <i class="icon-warning-sign"></i> {l s='Selecciona un transportista para comenzar' mod='matrizcarrier'}
                </div>
            {/if}
        </div>
    </div>
</div>

{* Modales *}
{include file="./modals.tpl"}

{* Botón flotante para aplicar a selección *}
<button type="button" class="btn btn-primary btn-apply-to-selected">
    <i class="icon-check"></i> <span class="selected-count"></span> {l s='Aplicar a selección' mod='matrizcarrier'}
</button>

<script>
    // Variables globales para JS
    window.matrizCarrierCurrency = '{$currency->sign}';
    window.matrizCarrierData = {
        carrierId: {$carrier_id|intval},
        prices: {$prices|@json_encode},
        zones: {$zones|@json_encode},
        ranges: {$ranges|@json_encode}
    };
</script>