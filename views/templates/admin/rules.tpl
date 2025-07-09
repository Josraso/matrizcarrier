{* views/templates/admin/rules.tpl *}

<div class="rules-container">
    <div class="panel">
        <div class="panel-heading">
            <i class="icon-gears"></i> {l s='Gestión de Reglas Automáticas' mod='matrizcarrier'}
            <span class="panel-heading-action">
                <a class="list-toolbar-btn" href="{$back_url}" title="{l s='Volver' mod='matrizcarrier'}">
                    <i class="process-icon-back"></i>
                </a>
            </span>
        </div>
        
        <div class="panel-body">
            <div id="rules-notifications"></div>
            
            <div class="rules-toolbar mb-20">
                <button type="button" class="btn btn-primary" id="create-rule-btn">
                    <i class="icon-plus"></i> {l s='Nueva regla' mod='matrizcarrier'}
                </button>
                
                <div class="btn-group">
                    <button type="button" class="btn btn-default" id="import-rules-btn">
                        <i class="icon-upload"></i> {l s='Importar' mod='matrizcarrier'}
                    </button>
                    <button type="button" class="btn btn-default" id="export-rules-btn">
                        <i class="icon-download"></i> {l s='Exportar' mod='matrizcarrier'}
                    </button>
                </div>
                
                <div class="pull-right">
                    <div id="bulk-actions" style="display: none;">
                        <span id="selected-count">0</span> {l s='seleccionadas' mod='matrizcarrier'}
                        <button type="button" class="btn btn-success" id="apply-selected-rules-btn">
                            <i class="icon-play"></i> {l s='Aplicar seleccionadas' mod='matrizcarrier'}
                        </button>
                    </div>
                </div>
            </div>
            
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th width="30"></th>
                        <th width="30">
                            <input type="checkbox" id="select-all-rules">
                        </th>
                        <th>{l s='Nombre' mod='matrizcarrier'}</th>
                        <th width="100">{l s='Tipo' mod='matrizcarrier'}</th>
                        <th width="80" class="text-center">{l s='Prioridad' mod='matrizcarrier'}</th>
                        <th width="80" class="text-center">{l s='Activa' mod='matrizcarrier'}</th>
                        <th width="150" class="text-right">{l s='Acciones' mod='matrizcarrier'}</th>
                    </tr>
                </thead>
                <tbody id="rules-list">
                    {foreach from=$rules item=rule}
                        <tr data-rule-id="{$rule.id_rule}">
                            <td class="drag-handle"><i class="icon-move"></i></td>
                            <td><input type="checkbox" class="rule-checkbox" value="{$rule.id_rule}"></td>
                            <td>
                                <strong>{$rule.name}</strong>
                                {if $rule.description}
                                    <br><small class="text-muted">{$rule.description}</small>
                                {/if}
                            </td>
                            <td>{$rule.type}</td>
                            <td class="text-center">{$rule.priority}</td>
                            <td class="text-center">
                                <span class="switch prestashop-switch fixed-width-sm">
                                    <input type="radio" name="rule_active_{$rule.id_rule}" id="rule_active_on_{$rule.id_rule}" value="1" {if $rule.active}checked{/if} class="rule-active-toggle" data-rule-id="{$rule.id_rule}">
                                    <label for="rule_active_on_{$rule.id_rule}">{l s='Sí' mod='matrizcarrier'}</label>
                                    <input type="radio" name="rule_active_{$rule.id_rule}" id="rule_active_off_{$rule.id_rule}" value="0" {if !$rule.active}checked{/if} class="rule-active-toggle" data-rule-id="{$rule.id_rule}">
                                    <label for="rule_active_off_{$rule.id_rule}">{l s='No' mod='matrizcarrier'}</label>
                                    <a class="slide-button btn"></a>
                                </span>
                            </td>
                            <td class="text-right">
                                <div class="btn-group">
                                    <button class="btn btn-default btn-sm edit-rule" data-rule-id="{$rule.id_rule}" title="{l s='Editar' mod='matrizcarrier'}">
                                        <i class="icon-edit"></i>
                                    </button>
                                    <button class="btn btn-default btn-sm test-rule" data-rule-id="{$rule.id_rule}" title="{l s='Probar' mod='matrizcarrier'}">
                                        <i class="icon-flask"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-rule" data-rule-id="{$rule.id_rule}" title="{l s='Eliminar' mod='matrizcarrier'}">
                                        <i class="icon-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {foreachelse}
                        <tr>
                            <td colspan="7" class="text-center">{l s='No hay reglas definidas' mod='matrizcarrier'}</td>
                        </tr>
                    {/foreach}
                </tbody>
            </table>
            
            <div class="panel-footer">
                <div class="help-block">
                    <i class="icon-info-circle"></i> {l s='Las reglas se aplican en orden de prioridad (mayor a menor). Arrastra las filas para reordenar.' mod='matrizcarrier'}
                </div>
            </div>
        </div>
    </div>
    
    {* Panel de ejemplos de reglas *}
    <div class="panel">
        <div class="panel-heading">
            <i class="icon-lightbulb"></i> {l s='Ejemplos de reglas útiles' mod='matrizcarrier'}
        </div>
        <div class="panel-body">
            <div class="row">
                <div class="col-lg-4">
                    <h4>{l s='Incremento por zona' mod='matrizcarrier'}</h4>
                    <p class="text-muted">{l s='Aumenta un 20% los precios para Canarias y Baleares' mod='matrizcarrier'}</p>
                    <ul class="small">
                        <li><strong>{l s='Condición:' mod='matrizcarrier'}</strong> Zona contiene "Canarias" O "Baleares"</li>
                        <li><strong>{l s='Acción:' mod='matrizcarrier'}</strong> Aumentar precio 20%</li>
                    </ul>
                </div>
                <div class="col-lg-4">
                    <h4>{l s='Descuento por volumen' mod='matrizcarrier'}</h4>
                    <p class="text-muted">{l s='10% de descuento para envíos de más de 20kg' mod='matrizcarrier'}</p>
                    <ul class="small">
                        <li><strong>{l s='Condición:' mod='matrizcarrier'}</strong> Peso desde > 20</li>
                        <li><strong>{l s='Acción:' mod='matrizcarrier'}</strong> Disminuir precio 10%</li>
                    </ul>
                </div>
                <div class="col-lg-4">
                    <h4>{l s='Precio mínimo' mod='matrizcarrier'}</h4>
                    <p class="text-muted">{l s='Establece un precio mínimo de 5€' mod='matrizcarrier'}</p>
                    <ul class="small">
                        <li><strong>{l s='Condición:' mod='matrizcarrier'}</strong> Precio actual < 5</li>
                        <li><strong>{l s='Acción:' mod='matrizcarrier'}</strong> Establecer precio 5</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
	{* Incluir modales *}
{include file="./modals.tpl"}
</div>

{* Input oculto para importar *}
<input type="file" id="import-rules-file" style="display: none;" accept=".json">