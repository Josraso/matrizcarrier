{* views/templates/admin/matrix.tpl *}
{extends file="helpers/view/view.tpl"}

{block name="override_tpl"}
<div class="matrizcarrier-container">
    <div class="row">
        <div class="col-lg-12">
            <div class="panel">
                <div class="panel-heading">
                    <i class="icon-truck"></i> {l s='Matriz de Tarifas' mod='matrizcarrier'} - {$carrier->name}
                    <span class="panel-heading-action">
                        <a class="list-toolbar-btn" href="{$back_url}" title="{l s='Volver al listado' mod='matrizcarrier'}">
                            <i class="process-icon-back"></i>
                        </a>
                    </span>
                </div>
                
                {* Alertas *}
                {if isset($confirmations) && $confirmations}
                    {foreach from=$confirmations item=confirmation}
                        <div class="alert alert-success">
                            <button type="button" class="close" data-dismiss="alert">×</button>
                            {$confirmation}
                        </div>
                    {/foreach}
                {/if}
                
                {if isset($errors) && $errors}
                    {foreach from=$errors item=error}
                        <div class="alert alert-danger">
                            <button type="button" class="close" data-dismiss="alert">×</button>
                            {$error}
                        </div>
                    {/foreach}
                {/if}

                {* Pestañas *}
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#matrix-tab" data-toggle="tab"><i class="icon-th"></i> {l s='Matriz de Precios' mod='matrizcarrier'}</a></li>
                    <li><a href="#ranges-tab" data-toggle="tab"><i class="icon-resize-horizontal"></i> {l s='Rangos de Peso' mod='matrizcarrier'}</a></li>
                    <li><a href="#config-tab" data-toggle="tab"><i class="icon-cogs"></i> {l s='Configuración' mod='matrizcarrier'}</a></li>
                    <li><a href="#import-export-tab" data-toggle="tab"><i class="icon-exchange"></i> {l s='Importar/Exportar' mod='matrizcarrier'}</a></li>
                    <li><a href="#stats-tab" data-toggle="tab"><i class="icon-bar-chart"></i> {l s='Estadísticas' mod='matrizcarrier'}</a></li>
                    <li><a href="#history-tab" data-toggle="tab"><i class="icon-time"></i> {l s='Historial' mod='matrizcarrier'}</a></li>
                </ul>

                <div class="tab-content">
                    {* Pestaña de Matriz *}
                    <div class="tab-pane active" id="matrix-tab">
                        <form method="post" action="{$current_url}" class="form-horizontal">
                            <div class="matrix-tools">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-default" id="apply-formula">
                                        <i class="icon-calculator"></i> {l s='Aplicar fórmula' mod='matrizcarrier'}
                                    </button>
                                    <button type="button" class="btn btn-default" id="copy-zone">
                                        <i class="icon-copy"></i> {l s='Copiar zona' mod='matrizcarrier'}
                                    </button>
                                    <button type="button" class="btn btn-default" id="clear-all">
                                        <i class="icon-eraser"></i> {l s='Limpiar todo' mod='matrizcarrier'}
                                    </button>
                                </div>
                                <div class="pull-right">
                                    <button type="submit" name="saveMatrix" class="btn btn-primary">
                                        <i class="icon-save"></i> {l s='Guardar cambios' mod='matrizcarrier'}
                                    </button>
                                </div>
                            </div>

                            {if $ranges|@count > 0}
                                <div class="table-responsive matrix-wrapper">
                                    <table class="table table-bordered matrix-table">
                                        <thead>
                                            <tr>
                                                <th class="fixed-column">{l s='Zona / Peso' mod='matrizcarrier'}</th>
                                                {foreach from=$ranges item=range}
                                                    <th class="text-center range-header" data-range="{$range.id_range_weight}">
                                                        {$range.delimiter1|string_format:"%.2f"} - {$range.delimiter2|string_format:"%.2f"} kg
                                                    </th>
                                                {/foreach}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {foreach from=$zones item=zone}
                                                <tr data-zone="{$zone.id_zone}">
                                                    <td class="zone-name fixed-column">
                                                        <strong>{$zone.name}</strong>
                                                        {if $zone.active == 0}
                                                            <span class="label label-warning">{l s='Inactiva' mod='matrizcarrier'}</span>
                                                        {/if}
                                                    </td>
                                                    {foreach from=$ranges item=range}
                                                        <td class="price-cell" data-zone="{$zone.id_zone}" data-range="{$range.id_range_weight}">
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
                            {else}
                                <div class="alert alert-info">
                                    <i class="icon-info-sign"></i> {l s='No hay rangos de peso definidos. Ve a la pestaña "Rangos de Peso" para añadir algunos.' mod='matrizcarrier'}
                                </div>
                            {/if}
                        </form>
                    </div>

                    {* Pestaña de Rangos *}
                    <div class="tab-pane" id="ranges-tab">
                        <form method="post" action="{$current_url}" class="form-horizontal">
                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Añadir nuevo rango' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <div class="row">
                                        <div class="col-lg-3">
                                            <div class="input-group">
                                                <input type="number" name="range_from" step="0.01" min="0" placeholder="{l s='Desde (kg)' mod='matrizcarrier'}" class="form-control">
                                                <span class="input-group-addon">kg</span>
                                            </div>
                                        </div>
                                        <div class="col-lg-3">
                                            <div class="input-group">
                                                <input type="number" name="range_to" step="0.01" min="0" placeholder="{l s='Hasta (kg)' mod='matrizcarrier'}" class="form-control">
                                                <span class="input-group-addon">kg</span>
                                            </div>
                                        </div>
                                        <div class="col-lg-3">
                                            <button type="submit" name="addRange" class="btn btn-primary">
                                                <i class="icon-plus"></i> {l s='Añadir rango' mod='matrizcarrier'}
                                            </button>
                                        </div>
                                    </div>
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
                                                <form method="post" action="{$current_url}" style="display:inline;">
                                                    <input type="hidden" name="id_range_weight" value="{$range.id_range_weight}">
                                                    <button type="submit" name="deleteRange" class="btn btn-danger btn-sm" 
                                                            onclick="return confirm('{l s='¿Eliminar este rango? Se eliminarán también todos los precios asociados.' mod='matrizcarrier' js=1}');">
                                                        <i class="icon-trash"></i>
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    {/foreach}
                                </tbody>
                            </table>
                        {/if}
                    </div>

                    {* Pestaña de Configuración *}
                    <div class="tab-pane" id="config-tab">
                        <form method="post" action="{$current_url}" class="form-horizontal">
                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Método de cálculo' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <select name="calculation_method" class="form-control fixed-width-xl">
                                        <option value="weight" {if $config.calculation_method == 'weight'}selected{/if}>{l s='Por peso' mod='matrizcarrier'}</option>
                                        <option value="price" {if $config.calculation_method == 'price'}selected{/if}>{l s='Por precio' mod='matrizcarrier'}</option>
                                        <option value="quantity" {if $config.calculation_method == 'quantity'}selected{/if}>{l s='Por cantidad' mod='matrizcarrier'}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Método de redondeo' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <select name="round_method" class="form-control fixed-width-xl">
                                        <option value="up" {if $config.round_method == 'up'}selected{/if}>{l s='Hacia arriba' mod='matrizcarrier'}</option>
                                        <option value="down" {if $config.round_method == 'down'}selected{/if}>{l s='Hacia abajo' mod='matrizcarrier'}</option>
                                        <option value="nearest" {if $config.round_method == 'nearest'}selected{/if}>{l s='Al más cercano' mod='matrizcarrier'}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Envío gratis a partir de' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <div class="input-group fixed-width-xl">
                                        <input type="number" name="free_shipping_starts_at" value="{$config.free_shipping_starts_at|default:0}" step="0.01" min="0" class="form-control">
                                        <span class="input-group-addon">{$currency->sign}</span>
                                    </div>
                                    <p class="help-block">{l s='Dejar en 0 para desactivar' mod='matrizcarrier'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Peso máximo' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <div class="input-group fixed-width-xl">
                                        <input type="number" name="max_weight" value="{$config.max_weight|default:0}" step="0.01" min="0" class="form-control">
                                        <span class="input-group-addon">kg</span>
                                    </div>
                                    <p class="help-block">{l s='Dejar en 0 para sin límite' mod='matrizcarrier'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Gastos de gestión' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <div class="input-group fixed-width-xl">
                                        <input type="number" name="handling_fee" value="{$config.handling_fee|default:0}" step="0.01" min="0" class="form-control">
                                        <span class="input-group-addon">{$currency->sign}</span>
                                    </div>
                                    <p class="help-block">{l s='Se añadirá al precio final del envío' mod='matrizcarrier'}</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">{l s='Activo' mod='matrizcarrier'}</label>
                                <div class="col-lg-9">
                                    <span class="switch prestashop-switch fixed-width-lg">
                                        <input type="radio" name="active" id="active_on" value="1" {if $config.active == 1}checked{/if}>
                                        <label for="active_on">{l s='Sí' mod='matrizcarrier'}</label>
                                        <input type="radio" name="active" id="active_off" value="0" {if $config.active != 1}checked{/if}>
                                        <label for="active_off">{l s='No' mod='matrizcarrier'}</label>
                                        <a class="slide-button btn"></a>
                                    </span>
                                </div>
                            </div>

                            <div class="panel-footer">
                                <button type="submit" name="saveConfig" class="btn btn-primary pull-right">
                                    <i class="icon-save"></i> {l s='Guardar configuración' mod='matrizcarrier'}
                                </button>
                            </div>
                        </form>
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
                                            <button type="submit" name="exportCSV" class="btn btn-primary">
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
                                            <div class="form-group">
                                                <label>{l s='Archivo CSV' mod='matrizcarrier'}</label>
                                                <input type="file" name="csv_file" accept=".csv" class="form-control">
                                                <p class="help-block">
                                                    {l s='El archivo debe tener el mismo formato que el exportado.' mod='matrizcarrier'}<br>
                                                    {l s='Separador: punto y coma (;)' mod='matrizcarrier'}<br>
                                                    {l s='Primera columna: nombres de zonas' mod='matrizcarrier'}<br>
                                                    {l s='Primera fila: rangos de peso (ej: 0-5)' mod='matrizcarrier'}
                                                </p>
                                            </div>
                                            <button type="submit" name="importCSV" class="btn btn-primary">
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
Europe;5.99;7.99;9.99;14.99
North America;12.99;15.99;19.99;29.99
South America;15.99;19.99;24.99;39.99</pre>
                            </div>
                        </div>
                    </div>

                    {* Pestaña de Estadísticas *}
                    <div class="tab-pane" id="stats-tab">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="panel">
                                    <div class="panel-heading">
                                        <i class="icon-bar-chart"></i> {l s='Distribución de precios por zona' mod='matrizcarrier'}
                                    </div>
                                    <div class="panel-body">
                                        <canvas id="pricesByZoneChart" height="200"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="panel">
                                    <div class="panel-heading">
                                        <i class="icon-bar-chart"></i> {l s='Precio medio por rango' mod='matrizcarrier'}
                                    </div>
                                    <div class="panel-body">
                                        <canvas id="avgPriceByRangeChart" height="200"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="panel">
                            <div class="panel-heading">
                                <i class="icon-info-circle"></i> {l s='Resumen' mod='matrizcarrier'}
                            </div>
                            <div class="panel-body">
                                <div class="row">
                                    <div class="col-lg-3 text-center">
                                        <h3>{$zones|@count}</h3>
                                        <p>{l s='Zonas activas' mod='matrizcarrier'}</p>
                                    </div>
                                    <div class="col-lg-3 text-center">
                                        <h3>{$ranges|@count}</h3>
                                        <p>{l s='Rangos de peso' mod='matrizcarrier'}</p>
                                    </div>
                                    <div class="col-lg-3 text-center">
                                        <h3 id="total-prices">0</h3>
                                        <p>{l s='Precios definidos' mod='matrizcarrier'}</p>
                                    </div>
                                    <div class="col-lg-3 text-center">
                                        <h3 id="avg-price">0</h3>
                                        <p>{l s='Precio medio' mod='matrizcarrier'}</p>
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
                                                {elseif $log.action == 'update_config'}
                                                    <span class="label label-warning">{l s='Actualizar config' mod='matrizcarrier'}</span>
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
        </div>
    </div>
</div>

{* Modales *}
<div class="modal fade" id="formulaModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Aplicar fórmula' mod='matrizcarrier'}</h4>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>{l s='Seleccionar celdas' mod='matrizcarrier'}</label>
                    <select id="formula-target" class="form-control">
                        <option value="all">{l s='Todas las celdas' mod='matrizcarrier'}</option>
                        <option value="empty">{l s='Solo celdas vacías' mod='matrizcarrier'}</option>
                        <option value="zone">{l s='Zona específica' mod='matrizcarrier'}</option>
                        <option value="range">{l s='Rango específico' mod='matrizcarrier'}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>{l s='Operación' mod='matrizcarrier'}</label>
                    <select id="formula-operation" class="form-control">
                        <option value="set">{l s='Establecer valor' mod='matrizcarrier'}</option>
                        <option value="increase">{l s='Aumentar %' mod='matrizcarrier'}</option>
                        <option value="decrease">{l s='Disminuir %' mod='matrizcarrier'}</option>
                        <option value="multiply">{l s='Multiplicar por' mod='matrizcarrier'}</option>
                        <option value="add">{l s='Sumar' mod='matrizcarrier'}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>{l s='Valor' mod='matrizcarrier'}</label>
                    <input type="number" id="formula-value" step="0.01" class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                <button type="button" class="btn btn-primary" id="apply-formula-btn">{l s='Aplicar' mod='matrizcarrier'}</button>
            </div>
        </div>
    </div>
</div>

<script>

window.matrizCarrierCurrency = '{$currency->sign}';
window.matrizCarrierAjaxUrl = '{$current_url}';
    var matrizCarrierData = {
        prices: {$prices|@json_encode},
        zones: {$zones|@json_encode},
        ranges: {$ranges|@json_encode},
        currency: '{$currency->sign}',
        translations: {
            confirmClear: '{l s='¿Estás seguro de que quieres limpiar todos los precios?' mod='matrizcarrier' js=1}',
            changeDetected: '{l s='Se han detectado cambios sin guardar' mod='matrizcarrier' js=1}',
            selectZone: '{l s='Selecciona una zona' mod='matrizcarrier' js=1}',
            selectRange: '{l s='Selecciona un rango' mod='matrizcarrier' js=1}'
        }
    };
</script>
{/block}
                                        <i class="icon-magic"></i> {l s='Rellenar diagonal' mod='matrizcarrier'}
                                    </button>
                                    <button type="button"