{* views/templates/admin/wizard.tpl *}

<div class="wizard-container">
    <div class="panel">
        <div class="panel-heading">
            <i class="icon-magic"></i> {l s='Asistente de Configuración de Transportista' mod='matrizcarrier'}
            <span class="panel-heading-action">
                <a class="list-toolbar-btn" href="{$back_url}" title="{l s='Volver' mod='matrizcarrier'}">
                    <i class="process-icon-back"></i>
                </a>
            </span>
        </div>
        
        <div class="panel-body">
            {* Pasos del wizard *}
            <div class="wizard-steps">
                <div class="wizard-step active" data-step="1">
                    <div class="wizard-step-number">1</div>
                    <div class="wizard-step-title">{l s='Información básica' mod='matrizcarrier'}</div>
                </div>
                <div class="wizard-step" data-step="2">
                    <div class="wizard-step-number">2</div>
                    <div class="wizard-step-title">{l s='Seleccionar plantilla' mod='matrizcarrier'}</div>
                </div>
                <div class="wizard-step" data-step="3">
                    <div class="wizard-step-number">3</div>
                    <div class="wizard-step-title">{l s='Configurar zonas' mod='matrizcarrier'}</div>
                </div>
                <div class="wizard-step" data-step="4">
                    <div class="wizard-step-number">4</div>
                    <div class="wizard-step-title">{l s='Definir rangos' mod='matrizcarrier'}</div>
                </div>
                <div class="wizard-step" data-step="5">
                    <div class="wizard-step-number">5</div>
                    <div class="wizard-step-title">{l s='Configurar precios' mod='matrizcarrier'}</div>
                </div>
                <div class="wizard-step" data-step="6">
                    <div class="wizard-step-number">6</div>
                    <div class="wizard-step-title">{l s='Revisar y confirmar' mod='matrizcarrier'}</div>
                </div>
            </div>
            
            {* Barra de progreso *}
            <div class="wizard-progress">
                <div class="wizard-progress-bar">
                    <div class="wizard-progress-fill"></div>
                </div>
            </div>
            
            {* Contenido del wizard *}
            <div class="wizard-content">
                {* Paso 1: Información básica *}
                <div id="wizard-step-1" class="wizard-panel active">
                    <h3>{l s='Información básica del transportista' mod='matrizcarrier'}</h3>
                    
                    <div class="form-group">
                        <label>{l s='Nombre del transportista' mod='matrizcarrier'} *</label>
                        <input type="text" id="carrier-name" class="form-control" required>
                        <p class="help-block">{l s='Este nombre será visible para los clientes' mod='matrizcarrier'}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>{l s='Tiempo de entrega' mod='matrizcarrier'}</label>
                        <input type="text" id="carrier-delay" class="form-control" placeholder="{l s='Ej: 24-48 horas' mod='matrizcarrier'}">
                    </div>
                    
                    <div class="form-group">
                        <label>{l s='Tipo de transportista' mod='matrizcarrier'} *</label>
                        <div class="carrier-type-selector">
                            <div class="carrier-type-card" data-type="standard">
                                <i class="icon-truck"></i>
                                <h4>{l s='Estándar' mod='matrizcarrier'}</h4>
                                <p>{l s='Envío regular con tarifas por peso' mod='matrizcarrier'}</p>
                            </div>
                            <div class="carrier-type-card" data-type="express">
                                <i class="icon-rocket"></i>
                                <h4>{l s='Express' mod='matrizcarrier'}</h4>
                                <p>{l s='Envío urgente 24-48h' mod='matrizcarrier'}</p>
                            </div>
                            <div class="carrier-type-card" data-type="heavy">
                                <i class="icon-archive"></i>
                                <h4>{l s='Carga pesada' mod='matrizcarrier'}</h4>
                                <p>{l s='Para productos voluminosos' mod='matrizcarrier'}</p>
                            </div>
                            <div class="carrier-type-card" data-type="custom">
                                <i class="icon-cogs"></i>
                                <h4>{l s='Personalizado' mod='matrizcarrier'}</h4>
                                <p>{l s='Configuración a medida' mod='matrizcarrier'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {* Paso 2: Seleccionar plantilla *}
                <div id="wizard-step-2" class="wizard-panel">
                    <h3>{l s='Selecciona una plantilla base' mod='matrizcarrier'}</h3>
                    <p>{l s='Las plantillas incluyen rangos y precios predefinidos que puedes personalizar' mod='matrizcarrier'}</p>
                    
                    <div class="template-grid">
                        {foreach from=$templates item=template}
                            <div class="template-preview-card" data-template="{$template.id_template}">
                                <h4>{$template.name}</h4>
                                <p>{$template.description}</p>
                                <div class="template-preview">
                                    {* Aquí iría una vista previa de la plantilla *}
                                </div>
                            </div>
                        {/foreach}
                        
                        <div class="template-preview-card" data-template="custom">
                            <h4>{l s='Empezar desde cero' mod='matrizcarrier'}</h4>
                            <p>{l s='Configura todo manualmente' mod='matrizcarrier'}</p>
                        </div>
                    </div>
                    
                    <div id="template-preview" class="mt-20"></div>
                </div>
                
                {* Paso 3: Configurar zonas *}
                <div id="wizard-step-3" class="wizard-panel">
                    <h3>{l s='Selecciona las zonas donde operará este transportista' mod='matrizcarrier'}</h3>
                    
                    <div class="zone-quick-actions mb-20">
                        <button type="button" class="btn btn-sm btn-default" data-action="select-all">
                            {l s='Seleccionar todas' mod='matrizcarrier'}
                        </button>
                        <button type="button" class="btn btn-sm btn-default" data-action="select-none">
                            {l s='Deseleccionar todas' mod='matrizcarrier'}
                        </button>
                        <button type="button" class="btn btn-sm btn-info" data-action="select-national">
                            {l s='Solo nacional' mod='matrizcarrier'}
                        </button>
                        <button type="button" class="btn btn-sm btn-info" data-action="select-eu">
                            {l s='Solo UE' mod='matrizcarrier'}
                        </button>
                    </div>
                    
                    <div class="zone-selector">
                        {* Las zonas se cargarían dinámicamente aquí *}
                        <div class="zone-group">
                            <div class="zone-group-header">{l s='Europa' mod='matrizcarrier'}</div>
                            <div class="zone-item" data-country="ES" data-eu="1">
                                <label>
                                    <input type="checkbox" value="1"> España
                                </label>
                            </div>
                            <div class="zone-item" data-country="PT" data-eu="1">
                                <label>
                                    <input type="checkbox" value="2"> Portugal
                                </label>
                            </div>
                            <div class="zone-item" data-country="FR" data-eu="1">
                                <label>
                                    <input type="checkbox" value="3"> Francia
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div id="selected-zones-count" class="mt-10 text-muted"></div>
                </div>
                
                {* Paso 4: Definir rangos *}
                <div id="wizard-step-4" class="wizard-panel">
                    <h3>{l s='Define los rangos de peso' mod='matrizcarrier'}</h3>
                    
                    <div class="range-presets mb-20">
                        <span>{l s='Presets:' mod='matrizcarrier'}</span>
                        <div class="range-preset" data-preset="light">{l s='Productos ligeros' mod='matrizcarrier'}</div>
                        <div class="range-preset" data-preset="standard">{l s='Estándar' mod='matrizcarrier'}</div>
                        <div class="range-preset" data-preset="heavy">{l s='Pesados' mod='matrizcarrier'}</div>
                        <div class="range-preset" data-preset="custom">{l s='Personalizado' mod='matrizcarrier'}</div>
                    </div>
                    
                    <div class="range-list" id="range-list">
                        {* Los rangos se mostrarán aquí *}
                    </div>
                    
                    <div class="add-range-form">
                        <input type="number" id="range-from" placeholder="{l s='Desde (kg)' mod='matrizcarrier'}" step="0.1" min="0">
                        <span>-</span>
                        <input type="number" id="range-to" placeholder="{l s='Hasta (kg)' mod='matrizcarrier'}" step="0.1" min="0">
                        <button type="button" id="add-range-btn" class="btn btn-primary">
                            <i class="icon-plus"></i> {l s='Añadir' mod='matrizcarrier'}
                        </button>
                    </div>
                </div>
                
                {* Paso 5: Configurar precios *}
                <div id="wizard-step-5" class="wizard-panel">
                    <h3>{l s='Configuración de precios' mod='matrizcarrier'}</h3>
                    
                    <div class="price-strategy-selector">
                        <div class="price-strategy-card selected" data-strategy="manual">
                            <h5>{l s='Manual' mod='matrizcarrier'}</h5>
                            <p>{l s='Introduce los precios manualmente en la matriz' mod='matrizcarrier'}</p>
                        </div>
                        <div class="price-strategy-card" data-strategy="formula">
                            <h5>{l s='Fórmula' mod='matrizcarrier'}</h5>
                            <p>{l s='Calcula los precios automáticamente con una fórmula' mod='matrizcarrier'}</p>
                        </div>
                        <div class="price-strategy-card" data-strategy="import">
                            <h5>{l s='Importar' mod='matrizcarrier'}</h5>
                            <p>{l s='Importa los precios desde un archivo' mod='matrizcarrier'}</p>
                        </div>
                    </div>
                    
                    <div class="price-formula-builder" style="display: none;">
                        <h4>{l s='Constructor de fórmulas' mod='matrizcarrier'}</h4>
                        <div class="formula-row">
                            <label>{l s='Precio base' mod='matrizcarrier'}</label>
                            <input type="number" id="formula-base" step="0.01" value="5">
                        </div>
                        <div class="formula-row">
                            <label>{l s='Por kg adicional' mod='matrizcarrier'}</label>
                            <input type="number" id="formula-weight-multiplier" step="0.01" value="0.5">
                        </div>
                        <div class="formula-row">
                            <label>{l s='Multiplicador por zona' mod='matrizcarrier'}</label>
                            <input type="number" id="formula-zone-multiplier" step="0.01" value="1">
                        </div>
                    </div>
                    
                    <div class="form-group mt-20">
                        <label>{l s='Gastos de gestión' mod='matrizcarrier'}</label>
                        <input type="number" id="handling-fee" class="form-control" step="0.01" value="0">
                        <p class="help-block">{l s='Se añadirá a todos los precios' mod='matrizcarrier'}</p>
                    </div>
                </div>
                
                {* Paso 6: Revisar y confirmar *}
                <div id="wizard-step-6" class="wizard-panel">
                    <h3>{l s='Revisa la configuración' mod='matrizcarrier'}</h3>
                    
                    <div id="review-content">
                        {* El contenido se generará dinámicamente *}
                    </div>
                </div>
            </div>
            
            {* Navegación del wizard *}
            <div class="wizard-navigation">
                <button type="button" class="btn btn-default btn-prev" disabled>
                    <i class="icon-chevron-left"></i> {l s='Anterior' mod='matrizcarrier'}
                </button>
                <button type="button" class="btn btn-primary btn-next">
                    {l s='Siguiente' mod='matrizcarrier'} <i class="icon-chevron-right"></i>
                </button>
                <button type="button" class="btn btn-success btn-finish" style="display: none;">
                    <i class="icon-check"></i> {l s='Crear transportista' mod='matrizcarrier'}
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    // Datos para el wizard
    window.wizardData = {
        templates: {$templates|@json_encode}
    };
</script>