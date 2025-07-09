{* views/templates/admin/visual_ranges.tpl *}

<div id="visual-range-editor" class="visual-range-editor">
    <div class="panel">
        <div class="panel-heading">
            <i class="icon-eye-open"></i> {l s='Editor Visual de Rangos de Peso' mod='matrizcarrier'}
            <span class="panel-heading-action">
                <a class="list-toolbar-btn" href="{$back_url}" title="{l s='Volver' mod='matrizcarrier'}">
                    <i class="process-icon-back"></i>
                </a>
            </span>
        </div>
        
        <div class="panel-body">
            <div id="visual-notifications"></div>
            
            {* Barra de herramientas *}
            <div class="visual-toolbar mb-20">
                <div class="btn-group">
                    <button type="button" class="btn btn-primary" id="add-visual-range">
                        <i class="icon-plus"></i> {l s='Añadir rango' mod='matrizcarrier'}
                    </button>
                    <button type="button" class="btn btn-default" id="split-range" disabled>
                        <i class="icon-cut"></i> {l s='Dividir' mod='matrizcarrier'}
                    </button>
                    <button type="button" class="btn btn-default" id="merge-ranges" disabled>
                        <i class="icon-resize-small"></i> {l s='Fusionar' mod='matrizcarrier'}
                    </button>
                </div>
                
                <div class="btn-group">
                    <button type="button" class="btn btn-default range-preset-btn" data-preset="standard">
                        <i class="icon-th-list"></i> {l s='Estándar' mod='matrizcarrier'}
                    </button>
                    <button type="button" class="btn btn-default range-preset-btn" data-preset="express">
                        <i class="icon-rocket"></i> {l s='Express' mod='matrizcarrier'}
                    </button>
                    <button type="button" class="btn btn-default range-preset-btn" data-preset="heavy">
                        <i class="icon-archive"></i> {l s='Pesados' mod='matrizcarrier'}
                    </button>
                    <button type="button" class="btn btn-default range-preset-btn" data-preset="detailed">
                        <i class="icon-th"></i> {l s='Detallado' mod='matrizcarrier'}
                    </button>
                </div>
                
                <div class="btn-group pull-right">
                    <button type="button" class="btn btn-default" id="zoom-out">
                        <i class="icon-zoom-out"></i>
                    </button>
                    <span id="zoom-level" class="btn">100%</span>
                    <button type="button" class="btn btn-default" id="zoom-in">
                        <i class="icon-zoom-in"></i>
                    </button>
                </div>
            </div>
            
            {* Configuración *}
            <div class="row mb-20">
                <div class="col-lg-3">
                    <div class="form-group">
                        <label>{l s='Peso máximo (kg)' mod='matrizcarrier'}</label>
                        <input type="number" id="max-weight-setting" class="form-control" value="100" min="1" step="1">
                    </div>
                </div>
                <div class="col-lg-3">
                    <div class="form-group">
                        <label>{l s='Precisión de la cuadrícula' mod='matrizcarrier'}</label>
                        <select id="grid-size" class="form-control">
                            <option value="0.1">0.1 kg</option>
                            <option value="0.5" selected>0.5 kg</option>
                            <option value="1">1 kg</option>
                            <option value="5">5 kg</option>
                        </select>
                    </div>
                </div>
                <div class="col-lg-3">
                    <div class="form-group">
                        <label>&nbsp;</label>
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" id="snap-to-grid" checked>
                                {l s='Ajustar a la cuadrícula' mod='matrizcarrier'}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3">
                    <div class="form-group">
                        <label>&nbsp;</label>
                        <div>
                            <button type="button" class="btn btn-success" id="save-visual-ranges">
                                <i class="icon-save"></i> {l s='Guardar rangos' mod='matrizcarrier'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {* Editor visual *}
            <div class="visual-editor-container">
                <div id="range-scale-container"></div>
                
                <div id="range-timeline" class="range-timeline">
                    {* Los rangos se dibujarán aquí dinámicamente *}
                </div>
                
                <div class="visual-help mt-10">
                    <small class="text-muted">
                        <i class="icon-info-circle"></i> 
                        {l s='Arrastra para mover, usa los bordes para redimensionar. Mantén Shift para copiar.' mod='matrizcarrier'}
                        {l s='Doble clic para editar valores exactos.' mod='matrizcarrier'}
                    </small>
                </div>
            </div>
            
            {* Panel lateral *}
            <div class="row mt-20">
                <div class="col-lg-8">
                    <div class="panel">
                        <div class="panel-heading">
                            <i class="icon-list"></i> {l s='Lista de rangos' mod='matrizcarrier'}
                        </div>
                        <div class="panel-body">
                            <div id="range-list" class="range-list"></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="panel">
                        <div class="panel-heading">
                            <i class="icon-edit"></i> {l s='Editar rango seleccionado' mod='matrizcarrier'}
                        </div>
                        <div class="panel-body">
                            <div class="form-group">
                                <label>{l s='Desde (kg)' mod='matrizcarrier'}</label>
                                <input type="number" id="range-from-input" class="form-control range-edit-controls" step="0.1" disabled>
                            </div>
                            <div class="form-group">
                                <label>{l s='Hasta (kg)' mod='matrizcarrier'}</label>
                                <input type="number" id="range-to-input" class="form-control range-edit-controls" step="0.1" disabled>
                            </div>
                            <div class="help-block">
                                {l s='Selecciona un rango para editarlo' mod='matrizcarrier'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="panel">
                        <div class="panel-heading">
                            <i class="icon-download"></i> {l s='Importar/Exportar' mod='matrizcarrier'}
                        </div>
                        <div class="panel-body">
                            <button type="button" class="btn btn-default btn-block" id="export-visual">
                                <i class="icon-download"></i> {l s='Exportar configuración' mod='matrizcarrier'}
                            </button>
                            <button type="button" class="btn btn-default btn-block" id="import-visual">
                                <i class="icon-upload"></i> {l s='Importar configuración' mod='matrizcarrier'}
                            </button>
                            <input type="file" id="import-visual-file" style="display: none;" accept=".json">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
/* Estilos específicos para el editor visual */
.visual-editor-container {
    position: relative;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    min-height: 200px;
}

#range-scale-container {
    position: relative;
    height: 30px;
    margin-bottom: 10px;
}

.range-scale {
    position: relative;
    height: 100%;
}

.scale-mark {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    text-align: center;
}

.scale-value {
    font-size: 11px;
    color: #666;
}

.scale-mark::before {
    content: '';
    display: block;
    width: 1px;
    height: 10px;
    background: #999;
    margin: 0 auto;
}

.range-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.grid-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #e0e0e0;
}

.range-list-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
}

.range-list-item:hover {
    background: #f8f9fa;
}

.range-list-item.selected {
    background: #e3f2fd;
}

.range-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 10px;
}

.range-text {
    flex: 1;
    font-weight: 500;
}

.range-actions {
    display: flex;
    gap: 5px;
}

.visual-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
</style>

<script>
    // Datos para el editor visual
    window.visualRangesData = {$ranges|@json_encode};
</script>