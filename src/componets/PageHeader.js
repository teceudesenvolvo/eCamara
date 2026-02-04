import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import MenuIcon from '@mui/icons-material/Menu';

const PageHeader = ({ 
    title, 
    onToggleFilters, 
    showFilterButton = true, 
    showPdfButton = true, 
    showPrintButton = true,
    extraActions 
}) => {
    return (
        <header className="dashboard-topbar">
            <button className="menu-toggle-btn" aria-label="Menu">
                <MenuIcon />
            </button>

            <h2 className="page-title">
                {title}
            </h2>
            
            <div className="topbar-actions">
                {extraActions}
                
                {showFilterButton && onToggleFilters && (
                    <Tooltip title="Filtrar / Pesquisar">
                        <button className="icon-btn" onClick={onToggleFilters}>
                            <FilterListIcon />
                        </button>
                    </Tooltip>
                )}
                
                {showPdfButton && (
                    <Tooltip title="Exportar PDF">
                        <button className="icon-btn">
                            <PictureAsPdfIcon />
                        </button>
                    </Tooltip>
                )}
                
                {showPrintButton && (
                    <Tooltip title="Imprimir">
                        <button className="icon-btn">
                            <PrintIcon />
                        </button>
                    </Tooltip>
                )}
            </div>
        </header>
    );
};

export default PageHeader;