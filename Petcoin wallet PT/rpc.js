// 2014 XDN Developers
// 2018 TurtleCoin Developers

/* Format to two decimal places */
function fromAtomic(num)
{
    return (num / 100).toFixed(2);
}

function toAtomic(num)
{
    return Math.round(num * 100);
}

function callRpc(method, params, callback)
{
    var url = "http://" + $("#rpcHost").val() + ":" + $("#rpcPort").val() + "/json_rpc";

    var request =
    {
        "params" : params,
        "jsonrpc" : "2.0",
        "id" : "test",
        "method" : method,
        "password" : config.rpcPassword
    };

    console.log('Sending RPC request to ' + url + ' with parameters: ' + JSON.stringify(params))
    
    console.log('Sending RPC request to ' + url + ' with parameters: ' + JSON.stringify(params))
    
    var resultNode = document.getElementById("rpc-result");
    /* Clear any previous errors */
    resultNode.innerHTML = "";

        $.ajax(
    {
        url: url,
        type: "POST",
        cache: false,
        data: JSON.stringify(request),

        success: function(result)
        {
            callback({success: true, result: result});
        },

        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log('Failed to contact walletd: jqXHR = ' + jqXHR + 
                        ', textStatus = ' + textStatus + ', errorThrown = ' +
                        errorThrown)

            if (errorThrown != "")
            {
                resultNode.innerHTML = "Falhou a ligacao a carteira: " + errorThrown;
            }
            else
            {
                resultNode.innerHTML = "Falhou a ligacao a carteira. Verifique se iniciou a carteira no ficheiro Start wallet";
            }

            callback({success: false, result: errorThrown});
        },

        dataType: "json"
    });
}

function sendTransaction(address, amount, fee, extra, paymentId)
{
    if (extra) {
        var params =
        {
            "transfers" : [{address: address, amount: toAtomic(amount)}],
            "fee" : toAtomic(fee),
            "anonymity" : config.mixin,
            "extra" : extra
        };
    } else if (paymentId) {
        var params =
        {
            "transfers" : [{address: address, amount: toAtomic(amount)}],
            "fee" : toAtomic(fee),
            "anonymity" : config.mixin,
            "paymentId" : paymentId
        };
    } else {
        var params =
        {
            "transfers" : [{address: address, amount: toAtomic(amount)}],
            "fee" : toAtomic(fee),
            "anonymity" : config.mixin
        };
    }

    var returnValue = callRpc("sendTransaction", params, function(returnValue)
    {
        if (returnValue.success)
        {
            var resultNode = document.getElementById("rpc-result");

            /* See if the RPC succeeded */
            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Transferencia nao enviada, erro: "
                                     + returnValue.result.error.message;
            }
            else
            {
                resultNode.innerHTML = "Transferencia efectuada,  hash de transferencia: "
                                     + returnValue.result.result.transactionHash;
            }
        }
    });
}

function getBalance()
{
    var returnValue = callRpc("getBalance", {}, function(returnValue)
    {
        if (returnValue.success)
        {
            var resultNode = document.getElementById("rpc-result");

            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Falha ao verificar saldo, erro: "
                                     + returnValue.result.error.message;
            }
            else
            {
                /* eep! */
                var json = returnValue.result.result;

                resultNode.innerHTML = "Saldo Contabilistico: "
                                     + fromAtomic(json.lockedAmount)
                                     + " XPET"
                                     + "</br>Saldo Disponivel: "
                                     + fromAtomic(json.availableBalance)
                                     + " XPET";
            }
        }
    });
}


 
function getAddresses()
{
    var returnValue = callRpc("getAddresses", {}, function(returnValue)
    {
        if (returnValue.success)
        {
			
            var resultNode = document.getElementById("rpc-result");

            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Falha ao ver endereco, erro: "
                                     + returnValue.result.error.message;
            }
            else
            {
                /* eep! */
                var json = returnValue.result.result;
                userAddress = json.addresses;
            }
        }
    });
}

function getTransactions()
{
	var params =
    {
        "blockCount" : 100000000,
		"firstBlockIndex":1
    };
    var returnValue = callRpc("getTransactions", params, function(returnValue)
    {
		console.log(returnValue);
        if (returnValue.success)
        {
            var resultNode = document.getElementById("rpc-result");

            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Falha ao ver transferencias, erro: "
                                     + returnValue.result.error.message;
            }
            else
            { 
                var json = returnValue.result.result.items;

                // Makes sure only prints last 10 transactions
				if (json.length > 10) {
                    var startFrom = json.length - 10;
                } else if (json.length < 10) {
                    var startFrom = 0;
                };

                if (json.length>0) {
					for (var i=startFrom;i<json.length;i++) {
						console.log(json[i].transactions[0].amount);
						if (json[i].transactions[0].amount > 0) {
							resultNode.innerHTML += "Transferencia recebida! Quantia " + fromAtomic(json[i].transactions[0].amount);
						} else {
							resultNode.innerHTML += "Transferencia enviada! Quantia " + fromAtomic(json[i].transactions[0].amount);
						}
						resultNode.innerHTML += "<br>";
					}
				} else {
					resultNode.innerHTML += "Sem Transferencias";
				}
			}
        }
    });
}
// Tread lightly
function getKeys()
{
	spendKey = 0;
	viewKey = 0;
	var returnValue = callRpc("getViewKey", {}, function(returnValue)
    {
        if (returnValue.success)
        {
            var resultNode = document.getElementById("rpc-result");

            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Falha ao ver chaves, erro: "
                                     + returnValue.result.error.message;
            }
            else
            { 
                viewKey = returnValue.result.result.viewSecretKey;
				resultNode.innerHTML = "IMPORTANTE: NAO PARTILHE AS SUAS CHAVES COM NINGUEM!! <br>View Key: "
                                     + viewKey;
            }
        }
    });
	var params =
	{
	"address" : userAddress[0]
	};
	var returnValue = callRpc("getSpendKeys", params, function(returnValue)
    {
        if (returnValue.success)
        {
            var resultNode = document.getElementById("rpc-result");

            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Falha ao verificar chaves, erro: "
                                     + returnValue.result.error.message;
            }
            else
            { 
                spendKey = returnValue.result.result.spendSecretKey;
				resultNode.innerHTML += "<br>Chave de Pagamento: "
                                     + spendKey;
            }
        }
    });
	
}
function getStatus()
{
    var returnValue = callRpc("getStatus", {}, function(returnValue)
    {
        if (returnValue.success)
        {
            
            var resultNode = document.getElementById("rpc-result");

            if (returnValue.result.hasOwnProperty("error"))
            {
                resultNode.innerHTML = "Falha ao ver endereco, erro: "
                                     + returnValue.result.error.message;
            }
            else
            {
                /* eep! */
                var json = returnValue.result.result;
                if ((json.knownBlockCount - json.blockCount) > 10) {
                    resultNode.innerHTML = "Sincronizando, bloco " + json.blockCount + " de " + json.knownBlockCount;
                } else {
                    resultNode.innerHTML = "Sincronizacao terminada! Pode agora usar a sua carteira!"
                }
            }
        }
    });
}

$(document).ready(function()
{
    document.getElementById('rpcHost').value = config.host;
    document.getElementById('rpcPort').value = config.port;

    var resultNode = document.getElementById("rpc-result");

    $('#getBalance').click(function()
    {
        console.log('getBalance() clicked...');
        getBalance();
    });

    $('#sendTransaction').click(function()
    {
        console.log('sendTransaction() clicked...')
        resultNode.innerHTML = "";

        var address = $("#address").val();
        var amount = $("#amount").val();
        var fee = $("#fee").val();
		var paymentId = $("#paymentId").val();
        var extra = $("#extra").val();

        if (address.length != config.addressLength || !address.startsWith("XPET"))
        {
            resultNode.innerHTML = "O endereco nao esta correcto. Deve ter "
                                 + config.addressLength + " caracteres e comecar com XPET.";
            return;
        }

        if (amount < config.minAmount)
        {
            resultNode.innerHTML = "Quantia demasiado baixa! Deve ser no minimo "
                                 + config.minAmount + " XPET.";
            return;
        }

        if (fee < config.minFee)
        {
            resultNode.innerHTML = "Taxa demasiado baixa! Deve ser no minimo "
                                 + config.minFee + " XPET.";
            return;
        }
		
		if (paymentId) {
				console.log("has PaymentId");
				
				if (!(/^[0-9A-F]{64}$/i.test(paymentId))) {
					resultNode.innerHTML = "PaymentId is not a hexdecimal 64 byte string!"
					return;
				}
                sendTransaction(address, amount, fee, null, paymentId);
		}
        if (extra) {
                console.log("has extra");
                
                if (!(/^[0-9a-fA-F]+$/.test(extra))) {
                    console.log("Extra is not a hexdecimal byte string! Converting automajically")
                

                    var arr1 = [];
                    for (var n = 0, l = extra.length; n < l; n ++) 
                     {
                        var hex = Number(extra.charCodeAt(n)).toString(16);
                        arr1.push(hex);
                     }
                    extra = arr1.join('');
                    console.log(extra)
                }
                sendTransaction(address, amount, fee, extra, null);
        }
        if (extra && paymentId) {
            resultNode.innerHTML = "Cannot have paymentId and extra set!";
            return;
        }
        if (!(extra || paymentId)) {
            sendTransaction(address, amount, fee);
        }
        
        
    });
	$('#getAddresses').click(function()
    {
        console.log('getAddresses() clicked...');
		getAddresses();
        resultNode.innerHTML = "Address " + userAddress;
    });
	$('#getTransactions').click(function()
    {
        console.log('getTransactions() clicked...');
        getTransactions();
    });
	$('#getKeys').click(function()
    {
        console.log('getKeys() clicked...');
        getKeys();
    });
    $('#getStatus').click(function()
    {
        console.log('getStatus() clicked...');
        getStatus();
    });
});
