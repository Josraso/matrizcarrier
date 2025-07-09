{* views/templates/admin/modals.tpl *}

{* Modal para crear transportista *}
<div class="modal fade" id="createCarrierModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Crear nuevo transportista' mod='matrizcarrier'}</h4>
            </div>
            <form method="post" action="{$current_url}">
                <div class="modal-body">
                    <div class="form-group">
                        <label>{l s='Nombre del transportista' mod='matrizcarrier'}</label>
                        <input type="text" name="new_carrier_name" class="form-control" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                    <button type="submit" name="create_carrier" class="btn btn-primary">
                        <i class="icon-plus"></i> {l s='Crear' mod='matrizcarrier'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{* Modal para aplicar fórmula *}
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
                        <option value="selected">{l s='Celdas seleccionadas' mod='matrizcarrier'}</option>
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
                        <option value="round">{l s='Redondear a múltiplo de' mod='matrizcarrier'}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>{l s='Valor' mod='matrizcarrier'}</label>
                    <input type="number" id="formula-value" step="0.01" class="form-control">
                    <p class="help-block">
                        {l s='Para porcentajes, introduce el número sin el símbolo %' mod='matrizcarrier'}
                    </p>
                </div>
                
                <div class="formula-examples">
                    <h5>{l s='Ejemplos:' mod='matrizcarrier'}</h5>
                    <ul>
                        <li>{l s='Aumentar 10%: Operación = Aumentar %, Valor = 10' mod='matrizcarrier'}</li>
                        <li>{l s='Establecer precio fijo: Operación = Establecer valor, Valor = 9.99' mod='matrizcarrier'}</li>
                        <li>{l s='Redondear a 0.50: Operación = Redondear, Valor = 0.50' mod='matrizcarrier'}</li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                <button type="button" class="btn btn-primary" id="apply-formula-btn">
                    <i class="icon-calculator"></i> {l s='Aplicar' mod='matrizcarrier'}
                </button>
            </div>
        </div>
    </div>
</div>

{* Modal para guardar plantilla *}
<div class="modal fade" id="saveTemplateModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Guardar como plantilla' mod='matrizcarrier'}</h4>
            </div>
            <form method="post" action="{$current_url}">
                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                <div class="modal-body">
                    <div class="form-group">
                        <label>{l s='Nombre de la plantilla' mod='matrizcarrier'}</label>
                        <input type="text" name="template_name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>{l s='Descripción' mod='matrizcarrier'}</label>
                        <textarea name="template_description" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="alert alert-info">
                        <i class="icon-info-sign"></i> {l s='Se guardará la configuración actual de rangos y precios' mod='matrizcarrier'}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                    <button type="submit" name="save_as_template" class="btn btn-success">
                        <i class="icon-save"></i> {l s='Guardar plantilla' mod='matrizcarrier'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{* Modal de exportación avanzada *}
<div class="modal fade" id="exportModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Exportación avanzada' mod='matrizcarrier'}</h4>
            </div>
            <form method="post" action="{$current_url}">
                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                <div class="modal-body">
                    <div class="form-group">
                        <label>{l s='Formato de exportación' mod='matrizcarrier'}</label>
                        <select name="export_format_advanced" class="form-control">
                            <option value="csv">{l s='CSV (Valores separados por comas)' mod='matrizcarrier'}</option>
                            <option value="xlsx">{l s='Excel (XLSX)' mod='matrizcarrier'}</option>
                            <option value="json">{l s='JSON' mod='matrizcarrier'}</option>
                            <option value="xml">{l s='XML' mod='matrizcarrier'}</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>{l s='Datos a exportar' mod='matrizcarrier'}</label>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="export_prices" value="1" checked>
                                {l s='Precios' mod='matrizcarrier'}
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="export_ranges" value="1" checked>
                                {l s='Rangos de peso' mod='matrizcarrier'}
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="export_zones" value="1" checked>
                                {l s='Información de zonas' mod='matrizcarrier'}
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="export_empty" value="1">
                                {l s='Incluir celdas vacías' mod='matrizcarrier'}
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>{l s='Filtros' mod='matrizcarrier'}</label>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="export_only_active_zones" value="1">
                                {l s='Solo zonas activas' mod='matrizcarrier'}
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="export_only_with_prices" value="1">
                                {l s='Solo zonas con precios definidos' mod='matrizcarrier'}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                    <button type="submit" name="export_advanced" class="btn btn-primary">
                        <i class="icon-download"></i> {l s='Exportar' mod='matrizcarrier'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{* Modal de importación con preview *}
<div class="modal fade" id="importModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Importación con vista previa' mod='matrizcarrier'}</h4>
            </div>
            <form method="post" action="{$current_url}" enctype="multipart/form-data">
                <input type="hidden" name="carrier_id" value="{$carrier_id}">
                <div class="modal-body">
                    <div class="form-group">
                        <label>{l s='Archivo a importar' mod='matrizcarrier'}</label>
                        <input type="file" name="import_file_preview" class="form-control" accept=".csv,.xlsx,.json,.xml" required>
                    </div>
                    
                    <div id="import-preview-container" style="display: none;">
                        <h5>{l s='Vista previa de datos' mod='matrizcarrier'}</h5>
                        <div id="import-preview-content"></div>
                        
                        <div class="form-group mt-20">
                            <label>{l s='Mapeo de columnas' mod='matrizcarrier'}</label>
                            <div id="column-mapping"></div>
                        </div>
                        
                        <div class="form-group">
                            <label>{l s='Opciones de importación' mod='matrizcarrier'}</label>
                            <div class="radio">
                                <label>
                                    <input type="radio" name="import_mode_preview" value="replace" checked>
                                    {l s='Reemplazar todos los datos' mod='matrizcarrier'}
                                </label>
                            </div>
                            <div class="radio">
                                <label>
                                    <input type="radio" name="import_mode_preview" value="merge">
                                    {l s='Combinar con datos existentes' mod='matrizcarrier'}
                                </label>
                            </div>
                            <div class="radio">
                                <label>
                                    <input type="radio" name="import_mode_preview" value="update">
                                    {l s='Solo actualizar precios existentes' mod='matrizcarrier'}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                    <button type="button" class="btn btn-info" id="preview-import-btn" style="display: none;">
                        <i class="icon-eye-open"></i> {l s='Vista previa' mod='matrizcarrier'}
                    </button>
                    <button type="submit" name="import_with_preview" class="btn btn-primary" style="display: none;">
                        <i class="icon-upload"></i> {l s='Importar' mod='matrizcarrier'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{* Modal de reglas *}
<div class="modal fade" id="ruleModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Crear/Editar regla' mod='matrizcarrier'}</h4>
            </div>
            <div class="modal-body">
                <input type="hidden" id="rule-id">
                
                <div class="form-group">
                    <label>{l s='Nombre de la regla' mod='matrizcarrier'}</label>
                    <input type="text" id="rule-name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label>{l s='Descripción' mod='matrizcarrier'}</label>
                    <textarea id="rule-description" class="form-control" rows="2"></textarea>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>{l s='Tipo' mod='matrizcarrier'}</label>
                            <select id="rule-type" class="form-control">
                                <option value="price">{l s='Precio' mod='matrizcarrier'}</option>
                                <option value="availability">{l s='Disponibilidad' mod='matrizcarrier'}</option>
                                <option value="both">{l s='Precio y disponibilidad' mod='matrizcarrier'}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label>{l s='Prioridad' mod='matrizcarrier'}</label>
                            <input type="number" id="rule-priority" class="form-control" value="0">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label>{l s='Activa' mod='matrizcarrier'}</label>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="rule-active" checked>
                                    {l s='Sí' mod='matrizcarrier'}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="rule-builder">
                    <h5>{l s='Condiciones' mod='matrizcarrier'} <small>({l s='Todas deben cumplirse' mod='matrizcarrier'})</small></h5>
                    <div id="conditions-container"></div>
                    <button type="button" class="btn btn-sm btn-default" id="add-condition-btn">
                        <i class="icon-plus"></i> {l s='Añadir condición' mod='matrizcarrier'}
                    </button>
                </div>
                
                <div class="rule-builder mt-20">
                    <h5>{l s='Acciones' mod='matrizcarrier'}</h5>
                    <div id="actions-container"></div>
                    <button type="button" class="btn btn-sm btn-default" id="add-action-btn">
                        <i class="icon-plus"></i> {l s='Añadir acción' mod='matrizcarrier'}
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                <button type="button" class="btn btn-info" id="test-rule-btn">
                    <i class="icon-flask"></i> {l s='Probar' mod='matrizcarrier'}
                </button>
                <button type="button" class="btn btn-primary" id="save-rule-btn">
                    <i class="icon-save"></i> {l s='Guardar' mod='matrizcarrier'}
                </button>
            </div>
        </div>
    </div>
</div>

{* Modal de prueba de reglas *}
<div class="modal fade" id="testRuleModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">{l s='Prueba de regla' mod='matrizcarrier'}</h4>
            </div>
            <div class="modal-body">
                <div id="test-results-container">
                    <p>{l s='Ejecutando prueba...' mod='matrizcarrier'}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cerrar' mod='matrizcarrier'}</button>
            </div>
        </div>
    </div>
</div>

{* Modal de selector de zona/rango *}
<div class="modal fade" id="selectorModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title" id="selector-title">{l s='Seleccionar' mod='matrizcarrier'}</h4>
            </div>
            <div class="modal-body">
                <div id="selector-content"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">{l s='Cancelar' mod='matrizcarrier'}</button>
                <button type="button" class="btn btn-primary" id="selector-confirm-btn">{l s='Seleccionar' mod='matrizcarrier'}</button>
            </div>
        </div>
    </div>
</div>

{* Loading overlay *}
<div class="loading-overlay" style="display: none;">
    <div class="loading-spinner"></div>
</div>

{* Notification container *}
<div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>