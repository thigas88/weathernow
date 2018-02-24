/* Weather Now - http://weather.testebox.com.br
 * https://github.com/thigas88/weathernow
 * Desenvolvido por Thiago Mendes
 * License: MIT <http://opensource.org/licenses/mit-license.php> - see LICENSE file
 */


// Loading
function loading(status, cidade) {

  if (status == "show") {

    $("<div id='loading'><img id='' src='images/loader.svg'></div>").insertBefore($("#"+cidade).find('.box-content'));

  } else if (status == "hide") {

    $("#"+cidade).find('#loading').remove();

  }

}

// Notificação
function notify(status, cidade) {

  if (status == "error") {

    $("<div id='loading'><span class='error-text'>Something went wrong</span><div> <a class='btn update-cidade' data-cidade='"+cidade+"'  onclick='updateCidade("+cidade+")' >Try Again</a> </div></div>").insertBefore($("#"+cidade).find('.box-content'));

  } 

}


// Retorna a class css dado um tipo de numero
function getClassNumber(number) {

  return ((number < 5) ? "positivo" : ((number >= 5 && number <= 25) ? "neutro" : "negativo"));

}


// Busca status temperatura cidade via api
function getWeatherCidade(cidade) {

  return $.ajax({
    type: "GET",
    dataType: "json",
    timeout: 10000,
    url: "http://api.openweathermap.org/data/2.5/weather?id="+ cidade +"&appid="+ api_key+"&units=metric", 
    beforeSend: function() {
        //
    },
    success: function(data) {
        setLasUpdate(cidade, Date.now());
        setCache(cidade, data);
        
        return data;
    },
    error: function() {
        return false;
    }
  });

}

// Monta conteúdo 
function setContentWeather(cidade, data) {
   
    var classe_temp = getClassNumber(data.main.temp);

    $("#"+cidade).find('.info-temperature').html('<span class="temperature-value '+classe_temp+'"><span class="info-number">'+data.main.temp.toFixed(0)+'<span class="type-metric">º</span></span></span>');
    $("#"+cidade).find('.humidity-number').html(data.main.humidity);
    $("#"+cidade).find('.pressure-number').html(data.main.pressure);
    
    $("#"+cidade).find('.date-updated').html(data.date_formated.toLocaleTimeString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    $("#"+cidade).find('#loading').hide();
}

// Define os atletas pontuados da rodada atual
function loadWeatherCidades() {

    $.each(cidades, function(idx, obj) {
    	console.log(obj.nome);
    	
    		$("#"+obj.id).find('#loading').show();
    	
    	var last_updated = getLastUpdate(obj.id);
    	
    	// se já se passaram 10min faz nova chamada
    	if( (Date.now() - last_updated) / 1000 > 600 ) {
    	    // terminou a chamada da busca dados temperatura
            getWeatherCidade(obj.id).done(function(result) {
                
                console.log(result);
                
                if(result !== false) {
                    
                    var date_formated = new Date(JSON.parse(getLastUpdate(obj.id)));
                    
                    result.date_formated = date_formated;
                    
                    setContentWeather(obj.id, result);
                   
                }else {
                    // Something went wrong
                    notify('error', obj.id);
                    
                }
            
            }).error(function(error){
                console.log(error);
                // Something went wrong
                notify('error', obj.id);
            });
    	}else{
    	    
    	    var data = JSON.parse(getCache(obj.id));
    	    
    	    if(data) {
    	        
    	        var date_formated = new Date(JSON.parse(last_updated));
    	        
    	        data.date_formated = date_formated;
                    
                setContentWeather(obj.id, data);
    	       
    	    }else {
                // Something went wrong
                notify('error', obj.id);
                    
            }
    	}
    	
    	
    });
    
    setTimeout(function(){ loadWeatherCidades() }, 600000);
}

function updateCidade(cidade) {
    // remove mensagem de error se houver
    $("#"+cidade).find('#loading').remove();
    
    // mostra loading
    loading('show', cidade);
    
    getWeatherCidade(cidade).done(function(result) {
                
        console.log(result);
        
        if(result !== false) {
            
            var date_formated = new Date(JSON.parse(getLastUpdate(cidade)));
            
            result.date_formated = date_formated;
                    
            setContentWeather(cidade, result);
            
        }else {
            
            // Something went wrong
            notify('error', cidade);
            
        }
    
    }).error(function(error) {
        
        console.log(error);
        
        // Something went wrong
        notify('error', cidade);
    });
}

// Busca a data da ultima atualização
function getLastUpdate(cidade) {
    
    return getCache('last_update_' + cidade);

}

// Seta a data da ultima atualização
function setLasUpdate(cidade, date) {
    
    setCache('last_update_' + cidade, date);
    
}

function getCache(cidade) {
    
    return window.localStorage.getItem(cidade);

}

function setCache(index, value) {
    
    window.localStorage.setItem(index, JSON.stringify(value));

}

// Inicializacao
function init() {

  // Vars
  api_key = '36312b0414d1db02f626fd62d13eff55';  
  
  // Lista de cidades
  cidades = [
    {
      'nome': 'Nuuk, GL',
      'id': '3421319',
      'country': 'GL',
        'coord': {
          'lon': -51.721569,
          'lat': 64.183472
        }
    },
    {
      'nome': 'Urubici, BR',
      'id': '3445709',
      'country': 'BR',
      'coord': {
          'lon': -49.591671,
          'lat': -28.014999
        }
    },
    {
      'nome': 'Nairobe, KE',
      'id': '184745', 
      'country': 'KE',
      'coord': {
          'lon': 36.816669,
          'lat': -1.28333
        }
    }
  ];

  // Efetua a leitura do status da temperatura das cidades
  loadWeatherCidades();
  
}

// Cacha do app
function initAppCache() {
    
    // Check if a new cache is available on page load.
    window.addEventListener('load', function(e) {

      window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          // Browser downloaded a new app cache.
          // Swap it in and reload the page to get the new hotness.
          window.applicationCache.swapCache();
          if (confirm('Está disponível uma nova versão deste aplicativ. Deseja atualizar?')) {
            window.location.reload();
          }
        } else {
          // Manifest didn't changed. Nothing new to server.
        }
      }, false);
    
    }, false);

}

// document ready, then init.
$(function() {
  initAppCache();
  init();
});
